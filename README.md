# Variable-Editor
This is a Qlik Sense mashup which allows Qlik Sense users to view, search and export variables from Qlik Sense environment (server or desktop) for any applications. This is the first iteration of this mashup using the capability API.

_IMPORTANT! This is Alpha release! There are some minor limitations with export function. Please see the [limilations](#known-bugs-and-limitations) section below._

# Why...
Qlik Sense variable UI currently does not have search functionality to search through all the variables. It also does not have any feature to export the list of variables out of the app. This mashup provides easy access to those functionalities without the need for configuring anything else. 

# Demo
<p align="center">
  <img width="90%" alt="variable Manager in action" src="https://github.com/kabir-rab/Variable-Editor/blob/master/variable-manager.gif">
</p>

# How to Install
## Desktop
Download this repo as .zip file. Once downloaded unzip all it's content to the following folder 
> Documents\Qlik\Sense\Extensions\

## Enterprise Server
Download this repo as .zip file. Once downloaded, use the QMC to upload the zip file just like any other extensions.

# How to use
Navigate to Dev-Hub and locate the mashup (should appear as "Variable Editor"). Right click on it > View, and that should open the mashup using the virtual proxy you are using already. If you would like to configure the virtual proxy or would like to deploy it to another server other than your Qlik Sense server, then please open the mashup in the editor mode and update the following script with the server details of your server in the "variable-editor.js" file.  

```javascript
//Please update your server details here if required
var prefix = window.location.pathname.substr( 0, window.location.pathname.toLowerCase().lastIndexOf( "/extensions" ) + 1 );
var config = {
	host: window.location.hostname,
	prefix: prefix,
	port: window.location.port,
	isSecure: window.location.protocol === "https:"
};
```

# Known bugs and limitations
 - Cannot perform a combined search - ex: front-end only variables with name containing "date". You can only perform one type of search, so Its either filter by the Script only or just search by name.
 - Only searches the name of the variables for now.
 - Export function only works on chrome for now. Also, during export "#" gets replaced by url encoded version (%23). Some bugs remained when double quotes and commas are used in variables.
 
 # What’s next
 Already porting this to use Engine API. Next version will tackle the updating of the variables, deletion of variables (including "delete all"), moving variables between apps and remove some of the current limitations... 

