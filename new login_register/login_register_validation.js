
var x = document.getElementById("Login");
var y = document.getElementById("Register");
var z = document.getElementById("btn");
var e = document.getElementById("box");

var password = document.getElementById("pass_id") , confirm_password = document.getElementById("confirm_password");
function validatePassword()
{
	if(password.value != confirm_password.value) {
		confirm_password.setCustomValidity("Passwords Don't Match");
	} else {
		confirm_password.setCustomValidity('');
	}
}
password.onchange = validatePassword;
confirm_password.onkeyup = validatePassword;
		
function Login_page()
{
	var data = new FormData();
	data.append('email', document.getElementById("email").value);
	e.style.height = "40%"
    x.style.left = "50px"
    y.style.left = "450px"
    z.style.left = "0px"
}

function Register_page()
{
	var data = new FormData();
    data.append('email', document.getElementById("email").value);
	data.append('password', document.getElementById("pass_id").value);
			
	e.style.height = "50%"
    x.style.left = "-400px"
    y.style.left = "50px"
    z.style.left = "110px"
}

function Main_page()
{
    
   window.open('main_page.html', "_self");
}