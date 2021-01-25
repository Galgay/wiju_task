let infoWindow;
        let map;
        let bounds; // 
        

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

            map.addListener("click", (marker) => {
                console.log(map);
                console.log('마커 추가');
                $('#marker_detail').show();
            });


            setMarker(map);
            drawPolygon(map);
        }
      
        function setMarker() {
            coords.forEach(function(coord) {
                let marker = new google.maps.Marker({
                    position: { lat: coord.lat, lng: coord.lng},
                    map
                });
                
                marker.addListener("click", (marker) => {
                    console.log(marker);
                    console.log('마커 수정 / 삭제');
                    // document.getElementById("marker_detail").display = "block";
                    $('#marker_detail').show();
                });
                bounds.extend(coord);
            });
        }

        function drawPolygon() {
            let polygon = new google.maps.Polygon({
                paths: coords,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "transparent",
            });
            polygon.setMap(map);
            polygon.addListener("click", showDetail);

            
            let mapLabel = new MapLabel({
                text: '위주지역',
                position: bounds.getCenter(),
                map: map,
                fontSize: 20,
                align: 'center'
            });
        }

        function showDetail(event) {
            let polygon = this;
            let vertices = polygon.getPath();
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
            // document.getElementById("marker_detail").display = "none";
            $('#marker_detail').hide();
        }

        // google.maps.event.addDomListener(window, 'load', );
        $( document ).ready(function() {
            initMap()
        });