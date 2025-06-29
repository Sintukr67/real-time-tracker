const socket=io();

// console.log('connected');
if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position)=>{
            const {latitude,longitude}=position.coords;
            socket.emit('send-location',{latitude,longitude});
        },
        (error)=>{
            console.error(error);
        },
        {
        enableHighAccuracy: true,
        timeout:5000,
        maximumAge:0,
        }

    );
}

const map=L.map('map').setView([0,0],10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"your welcome here"
}).addTo(map)

const markers={};

socket.on('receive-location',(data)=>{
    const{id,latitude,longitude}=data;
    
    if(!markers[id]) map.setView([latitude,longitude],10);
    
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    }else{
        markers[id]=L.marker([latitude,longitude]).addTo(map);
    }
});

socket.on('user-disconnected',(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});