(function(){
    let senderID;
    const socket=io();

    function generateID() {
        return `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`;
    }
        document.querySelector("#reciver-start-con-btn").addEventListener("click",function(){
            senderID=document.querySelector("#join-id").value;
            if(senderID.length==0){
                return;
            }
            let joinID=generateID();
            socket.emit("reciver-join",{
                uid:joinID,
                sender_uid:senderID
            });
            document.querySelector(".join-screen").classList.remove("active");
            document.querySelector(".fs-screen").classList.add("active");
        });

        let fileshare={};
        socket.on("fs-meta",function(metadata){
            fileshare.metadata=metadata;
            fileshare.transmitted=0;
            fileshare.buffer=[];

            let el=document.createElement("div");
            el.classList.add("item");
            el.innerHTML=`
                <div class="progress">0%</div>
                <div class="filename">${metadata.filename}</div>
            `;
            document.querySelector(".files-list").appendChild(el);
            
            fileshare.progress_node=el.querySelector(".progress");

            socket.emit("fs-start",{
                uid:senderID                
            });
        });
        socket.on("fs-share",function(buffer){
            fileshare.buffer.push(buffer);
            fileshare.transmitted += buffer.byteLength;
            fileshare.progress_node.innerHTML=Math.trunc(fileshare.transmitted/fileshare.metadata.total_buffer_size*100)+"%";
            if (fileshare.transmitted==fileshare.metadata.total_buffer_size) {
                download(new Blob(fileshare.buffer),fileshare.metadata.filename);
                fileshare={};
            }else{
                socket.emit("fs-start",{
                    uid:senderID
                });
            }
        });
})();