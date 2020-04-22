document.addEventListener('DOMContentLoaded', ajaxEdit);

function ajaxEdit(){
    document.getElementById("editSave").addEventListener('click', function(event){
        let req = new XMLHttpRequest();
        let id = document.getElementsByName("id")[0].value;
        let name = document.getElementsByName("name")[0].value;
        let reps = document.getElementsByName("reps")[0].value;
        let weight = document.getElementsByName("weight")[0].value;
        let date = document.getElementsByName("date")[0].value;
        let lbs = document.getElementsByName("lbs")[0].checked;
        req.open('POST', '/edit', true);
        let payload = JSON.stringify({"name": name, "reps": reps, "weight": weight, "date": date, "lbs": lbs, "id": id});
        req.setRequestHeader('Content-Type', 'application/json');
        
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                let response = JSON.parse(req.responseText);
                console.log(response);
                window.location = response.redirectUrl;
            } else {
                console.log("POST Error: " + req.statusText);
          }});

        req.send(payload);
        event.preventDefault();
    });
}