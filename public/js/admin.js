// When the user scrolls down 5px from the top of the document,we will show the button
window.onscroll = function()
{
if (document.body.scrollTop > 5 || document.documentElement.scrollTop > 5)
{
document.getElementById("myBtn").style.display = "block";
}
else
{
document.getElementById("myBtn").style.display = "none";
}
};


function scrollToTop()
{
document.body.scrollTop = 0; // For Safari
document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function openNav() {
    document.getElementById("mySidenav").style.width = "200px";
  }
  
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }


// document.getElementById('import').onclick = function() 
// {
//   var files = document.getElementById('selectFiles').files;
//   console.log(files);
//   if (files.length <= 0) {
//     return false;
//   }

//   var fr = new FileReader();

//   fr.onload = function(e) { 
//   console.log(e);
//     var result = JSON.parse(e.target.result);
//     var formatted = JSON.stringify(result, null, 2);
//         document.getElementById('result').value = formatted;
//   }

//   fr.readAsText(files.item(0));
// };

// const uploadForm = document.querySelector('.upload')
// uploadForm.addEventListener('submit', function(e) {
//   e.preventDefault()
//   let file = e.target.uploadFile.files[0]
// })

// fetch('http://localhost:3000/users', {
//    method: "POST",
//    headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json"
//    },
//    body: JSON.stringify({
//       name: name,
//    })
// })
// .then(resp => resp.json())
// .then(data => {
//    // do something here
// })

// const uploadForm = document.querySelector('.upload')
// uploadForm.addEventListener('submit', function(e) {
//   e.preventDefault()
//   let file = e.target.uploadFile.files[0]   
//   let formData = new FormData()
//   formData.append('file', file)
// })

