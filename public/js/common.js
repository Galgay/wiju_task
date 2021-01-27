let map; // 현재 표시되는 map
let bounds; // 구역 가운데 지점을 가져오기 위한 bounds
let markers = []; // 전체 마커 배열
let curMarker; // 마커 수정/삭제 시 현재 선택된 마커
let polygon; // 구역을 표시하는 Polygon
let mapLabel; // 구역 내에 표시되는 mapLabel
let infoWindow; // Polygon 클릭 시 표시되는 infoWindow

// 위경도 더미 데이터
let coords = [
    { lat: 37.48123178868246, lng: 126.87878131935113},
    { lat: 37.48319212850644, lng: 126.88391126793803},
    { lat: 37.47817607684235, lng: 126.88655324811283},
    { lat: 37.47539622794932, lng: 126.8817188041164},
];

$(document).ready(function() {
    initMap();
    $('#btn_save').click(function() {
        addMarker();
    });
    $('#btn_update').click(function() {
        updateMarker();
    });
    $('#btn_delete').click(function() {
        deleteMarker();
    })
});

// 맵 생성 (메서드 분리 필요)
function initMap() {
    setBound();
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        center:  bounds.getCenter(),
    });

    map.addListener("click", function(event) {
        const lat = event.latLng.lat;
        const lng = event.latLng.lng;
        openModal('N', lat, lng);
    });

    setMarker();
    drawPolygon();
}

// Coord 데이터의 가운데 지점 설정
function setBound() {
    bounds = new google.maps.LatLngBounds();
    
    coords.forEach(function(coord) {
        bounds.extend(coord);
    });
}

// Coord 데이터별 마커 생성
function setMarker() {
    setBound();
    if (markers.length > 0) {
        $.each(markers, function(index, item) {
            item.setMap(null);
        });
        markers = [];
    }
    coords.forEach(function(coord) {
        const marker = new google.maps.Marker({
            position: { lat: coord.lat, lng: coord.lng},
            map
        });
        
        marker.addListener("click", function(event) {
            curMarker = marker;
            const lat = event.latLng.lat;
            const lng = event.latLng.lng;
            openModal('U', lat, lng);
        });
        markers.push(marker);
    });
}

// Coord 데이터 이용하여 Polygon 생성
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
    polygon.addListener("click", function(mapsMouseEvent) {
        // showDetail
        
        const lat = mapsMouseEvent.latLng.lat;
        const lng = mapsMouseEvent.latLng.lng;
        openModal('N', lat, lng);
    });

    
    mapLabel = new MapLabel({
        text: '위주지역',
        position: bounds.getCenter(),
        map: map,
        fontSize: 20,
        align: 'center'
    });
}

// Polygon 클릭 시 상세 정보
function showDetail(event) {
    const contentString =
        "<b>위주 구역</b>" + 
        "<br><br>위주지역입니다.";

    if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow();
    }
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}

// 좌표 추가/수정/삭제 모달 Open
function openModal(type, lat, lng) {
    $('#btn_save').show();
    $('#btn_update').show();
    $('#btn_delete').show();  
    $('.desc-wrap').show();  

    // 마커 신규 생성
    if (type == 'N') {
        $('#modal_title').html('마커 생성');
        $('#btn_update').hide();
        $('#btn_delete').hide();  
        $('.desc-wrap').hide(); 
    }
    // 마커 수정 및 삭제
    else if (type == 'U') {
        $('#modal_title').html('마커 상세');
        $('#btn_save').hide();
    }

    if (lat && lng) {
        $('#lat').val(lat);
        $('#lng').val(lng);
    }
    $('#marker_detail').show();
}

// 좌표 추가/수정/삭제 모달 Close
function closeModal() {
    $('#lat').val('');
    $('#lng').val('');  
    $('#marker_detail').hide();
    curMarker = null;
}

// 마커 추가
function addMarker() {
    const lat = $('#lat').val();
    const lng = $('#lng').val();  

    if (!isValidCoord(lat, lng)) {
        return false;
    }

    // 위경도 중복 체크
    const idx = coords.findIndex(function(item) {
            return item.lat == lat && item.lng == lng;
        }
    );
    if (idx != -1) {
        alert('이미 해당 좌표에 마커가 있습니다.');
        return false;
    }

    coords.push({ lat: Number(lat), lng : Number(lng)});
    setMarker();
    drawPolygon();
    closeModal();
}

// 마커 수정
function updateMarker() {
    const curCoord = curMarker.getPosition();
    const curLat = curCoord.lat();
    const curLng = curCoord.lng();
    let lat = $('#lat').val();
    let lng = $('#lng').val();  

    // 유효한 위경도인지 체크
    if (!isValidCoord(lat, lng)) {
        return false;
    }

    lat = Number(lat);
    lng = Number(lng);
    
    // 수정할 좌표 데이터 idx
    const targetIdx = coords.findIndex(function(item) {
            return item.lat === curLat && item.lng == curLng;
        }
    );

    if (targetIdx > -1) {
        // 위경도 중복 체크
        const idx = coords.findIndex(function(item, index) {
                // 현재 수정 중인 데이터가 아니며, 위경도가 동일한 데이터가 있는지 체크
                return item.lat == lat && item.lng == lng && index != targetIdx;
            }
        );
        if (idx != -1) {
            alert('이미 해당 좌표에 마커가 있습니다.');
            return false;
        }
        coords[targetIdx].lat = lat;
        coords[targetIdx].lng = lng;
    }

    setMarker();
    drawPolygon();
    closeModal();
}

// 마커 삭제
function deleteMarker() {
    if (curMarker) {
        const coord = curMarker.getPosition();
        
        // 위경도 삭제
        const idx = coords.findIndex(function(item) {
                return item.lat === coord.lat() && item.lng == coord.lng();
            }
        );
        if (idx > -1) {
            coords.splice(idx, 1);
        }
        
        // 마커 삭제
        const markerIdx = markers.findIndex(function(item) {
                return item == curMarker;
            }
        );
        if (markerIdx > -1) {
            markers.splice(idx, 1);
        }
        curMarker.setMap(null);
        
        setBound();
        drawPolygon();
        closeModal();
    }
}

function isValidCoord(lat, lng) {
    if (!lat) { 
        alert('위도를 입력해주세요.');
        return false;
    }

    if (!lng) { 
        alert('경도를 입력해주세요.');
        return false;
    }

    if (!$.isNumeric(lat) ) { 
        alert('위도에는 숫자만 입력 가능합니다.');
        return false;
    }

    if (!$.isNumeric(lng)) { 
        alert('경도에는 숫자만 입력 가능합니다.');
        return false;
    }

    if (lat > 90 || lat < -90) {
        alert('위도의 범위는 -90 ~ 90까지 입력 가능합니다.');
        return false;
    }
    
    if (lng > 180 || lng < -180) {
        alert('경도의 범위는 -180 ~ 180까지 입력 가능합니다.');
        return false;
    }

    return true;
}

// 숫자 및 하나의 '.'만 입력 가능하도록 처리
function isNumberKey(evt, obj) {
    const charCode = evt.which || evt.keyCode; 

    // 숫자 또는 '.'이 아닌 경우
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }

    // 내용에 '.'이 있는데 추가로 입력한 경우
    if ($(obj).val().indexOf('.') != -1) {
        if (charCode == 46) {
            return false;
        }
    }
}

