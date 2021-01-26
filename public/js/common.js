let infoWindow;
let map;
let bounds;
let polygon;
let markers = [];
let curMarker;
let mapLabel;

$(document).ready(function() {
    initMap();
    $('#btn_save').click(function() {
        addMarker();
    });
    $('#btn_delete').click(function() {
        if (curMarker) {
            let coord = curMarker.getPosition();
            
            let idx = coords.findIndex(function(item) {
                    return item.lat === coord.lat() && item.lng == coord.lng()
                }
            );

            if (idx > -1) {
                coords.splice(idx, 1)
            }

            
            let markerIdx = markers.findIndex(function(item) {
                    return item == curMarker
                }
            );

            if (markerIdx > -1) {
                markers.splice(idx, 1)
            }
            curMarker.setMap(null);
            // setMarker(map);
            
            bounds = new google.maps.LatLngBounds();
            coords.forEach(function(coord) {
                bounds.extend(coord);
            });
            drawPolygon(map);
            closeModal();
        }
    })
});

// 위경도 더미 데이터
let coords = [
    { lat: 37.48123178868246, lng: 126.87878131935113},
    { lat: 37.48319212850644, lng: 126.88391126793803},
    { lat: 37.47817607684235, lng: 126.88655324811283},
    { lat: 37.47539622794932, lng: 126.8817188041164},
];

// 맵 생성 (메서드 분리 필요)
function initMap() {
    bounds = new google.maps.LatLngBounds();
    
    coords.forEach(function(coord) {
        bounds.extend(coord);
    });

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        center:  bounds.getCenter(),
    });

    map.addListener("click", (mapsMouseEvent) => {
        console.log();
        console.log('마커 추가');
        let lat = mapsMouseEvent.latLng.lat;
        let lon = mapsMouseEvent.latLng.lng;
        $('#lat').val(lat);
        $('#lon').val(lon);
        openModal('N');
    });

    setMarker(map);
    drawPolygon(map);
}

function setMarker() {
    bounds = new google.maps.LatLngBounds();
    if (markers.length > 0) {
        $.each(markers, function(index, item) {
            item.setMap(null);
        });
        markers = [];
    }
    coords.forEach(function(coord) {
        let marker = new google.maps.Marker({
            position: { lat: coord.lat, lng: coord.lng},
            map
        });
        
        marker.addListener("click", (event) => {
            curMarker = marker;
            console.log('마커 수정 / 삭제');
            // document.getElementById("marker_detail").display = "block";
            openModal('U');
        });
        bounds.extend(coord);
        markers.push(marker);
    });
}

function drawPolygon() {
    if (mapLabel) {
        mapLabel.setMap(null);
    }
    if (polygon) {
        polygon.setMap(null);
    }
    polygon = new google.maps.Polygon({
        paths: coords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "transparent",
    });
    polygon.setMap(map);
    polygon.addListener("click", showDetail);

    
    mapLabel = new MapLabel({
        text: '위주지역',
        position: bounds.getCenter(),
        map: map,
        fontSize: 20,
        align: 'center'
    });
}

function showDetail(event) {
    let contentString =
    "<b>위주 구역</b><br><br>위주지역입니다.";

    if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow();
    }
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}

function closeModal() {
    $('#marker_detail').hide();
    curMarker = null;
}

function openModal(type) {
    $('#btn_save').show();
    $('#btn_modify').show();
    $('#btn_delete').show();     

    // 마커 신규 생성
    if (type == 'N') {
        $('#modal_title').html('마커 생성');
        $('#btn_modify').hide();
        $('#btn_delete').hide();   
    }
    // 마커 수정 및 삭제
    else if (type == 'U') {
        $('#modal_title').html('마커 수정/삭제');
        $('#btn_save').hide();
    }
    $('#marker_detail').show();
}

function addMarker() {
    let lat = $('#lat').val();
    let lon = $('#lon').val();  
    
    if (!lat || !lon) {
        alert('위도와 경도를 모두 입력해주세요.');
        return false;
    }
    coords.push({ lat: Number(lat), lng : Number(lon)})
    setMarker(map);
    drawPolygon(map);
    closeModal();
}