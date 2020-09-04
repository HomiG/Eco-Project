function onloadBody(){
submitObject();
}

function submitObject(){
    
    $.ajax({
        url: "/statistics",
        type: "post",
        cache: false,
        contentType: false,
        processData: false,
        data: false,
        success: function (response) {
            
            console.log(response)
            
        }
    })
}