document.addEventListener('DOMContentLoaded', ajaxSubmit);
document.addEventListener('DOMContentLoaded', ajaxDelete);
document.addEventListener('DOMContentLoaded', ajaxEdit);

function ajaxSubmit(){
    document.getElementById("newSubmit").addEventListener('click', function(event){
        let req = new XMLHttpRequest();
        let name = document.getElementsByName("name")[0].value;
        let reps = document.getElementsByName("reps")[0].value;
        let weight = document.getElementsByName("weight")[0].value;
        let date = document.getElementsByName("date")[0].value;
        let lbs = document.getElementsByName("lbs")[0].checked;
        req.open('POST', '/', true);
        let payload = JSON.stringify({"name": name, "reps": reps, "weight": weight, "date": date, "lbs": lbs});
        req.setRequestHeader('Content-Type', 'application/json');
        
        req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                let response = JSON.parse(req.responseText);
                console.log(response);
                document.getElementById('newMsg').textContent = response.newMsg;
                if(response.results){
                    addToTable(response.results[response.results.length-1]);
                }
            } else {
                console.log("POST Error: " + req.statusText);
          }});

        req.send(payload);
        event.preventDefault();
    });
}

function ajaxDelete(){
    var deleteButtons = document.getElementsByClassName("deleteButton");

    for(let i = 0; i<deleteButtons.length; i++){
        let thisButton = deleteButtons[i];
        deleteButtons[i].addEventListener('click', function(event){
            let req = new XMLHttpRequest();
            req.open('DELETE', '/', true);

            let payload = JSON.stringify({"id": thisButton.parentNode.childNodes[1].value});
            req.setRequestHeader('Content-Type', 'application/json');

            req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var response = JSON.parse(req.responseText);
                console.log(response);
                document.getElementById('newMsg').textContent = response.newMsg;
                deleteFromTable(response.delRowId);
            } else {
                console.log("POST Error: " + req.statusText);
              }});

            req.send(payload);
            event.preventDefault();
        });
    }
}

function ajaxEdit(){
    var editButtons = document.getElementsByClassName("editButton");

    for(let i = 0; i<editButtons.length; i++){
        let thisButton = editButtons[i];
        editButtons[i].addEventListener('click', function(event){
            let req = new XMLHttpRequest();
            req.open('PATCH', '/', true);
    
            let payload = JSON.stringify({"id": thisButton.parentNode.childNodes[1].value});
            req.setRequestHeader('Content-Type', 'application/json');

            req.addEventListener('load',function(){
            if(req.status >= 200 && req.status < 400){
                var response = JSON.parse(req.responseText);
                console.log(response);
                window.location = response;
            } else {
                console.log("POST Error: " + req.statusText);
              }});

            req.send(payload);
            event.preventDefault();
        });
    }
}

function deleteFromTable(id){
    console.log("row_"+id);
    var row2Del = document.getElementById("row_"+id);
    row2Del.parentNode.removeChild(row2Del);
}

function addToTable(obj){
    var logTable = document.getElementById("exerciseLogBody");
    var newRow = document.createElement('tr');
   
    for(var key in obj){
        var newCell = document.createElement('td');
        newCell.textContent = obj[key];
        newRow.appendChild(newCell.cloneNode(true));
    }
    var delCell = document.createElement('td');
    var delButton = document.createElement('button');
    delButton.id = "delete_"+obj["id"];
    delButton.className = "deleteButton";
    delButton.textContent = "Delete";
    delCell.appendChild(delButton.cloneNode(true));

    var editCell = document.createElement('td');
    var editButton = document.createElement('button');
    editButton.id = "edit_"+obj["id"];
    editButton.className = "editButton";
    editButton.textContent = "Edit";
    editCell.appendChild(editButton.cloneNode(true));
    
    newRow.id = "row_"+obj["id"];
    newRow.appendChild(delCell.cloneNode(true));
    newRow.appendChild(editCell.cloneNode(true));
    logTable.appendChild(newRow.cloneNode(true));

    document.getElementById("delete_"+obj["id"]).addEventListener('click', function(event){
        let req = new XMLHttpRequest();
        req.open('DELETE', '/', true);

        let payload = JSON.stringify({"id": obj["id"]});
        req.setRequestHeader('Content-Type', 'application/json');

        req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText);
            console.log(response);
            document.getElementById('newMsg').textContent = response.newMsg;
            deleteFromTable(response.delRowId);
        } else {
        console.log("POST Error: " + req.statusText);
          }});

        req.send(payload);
        event.preventDefault();
    });

    document.getElementById("edit_"+obj["id"]).addEventListener('click', function(event){
        let req = new XMLHttpRequest();
        req.open('PATCH', '/', true);
        let payload = JSON.stringify({"id": obj["id"]});
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
            var response = JSON.parse(req.responseText);
            console.log(response);
            window.location = response;
            console.log("done?");
        } else {
            console.log("POST Error: " + req.statusText);
          }
        });

        req.send(payload);
        event.preventDefault();
    });
}