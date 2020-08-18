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

<<<<<<< HEAD
  
=======
// var uplodBtn=document.getElementById("uploadBtn");
// uplodBtn.addEventListener("click",uploadFile());

function uploadFile(){
  
  window.location.href="/upload"

}
>>>>>>> acd884a5576f20c0247d3c48b9380f1e825a350f
