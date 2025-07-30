# Talking PDF
## Requirements
For development, you will only need Node.js installed on your environement.
Node is really easy to install & now include NPM. You should be able to run the following command after the installation procedure below.
```
$ node --version
v22.17.1
#or different but no issues

$ npm --version
10.9.2
#or different but no issues
```
## Node installation
Just go on [official Node.js website](https://nodejs.org/en) & grab the installer. Also, be sure to have git available in your PATH, npm might need it.

## Install
download and Install ollama
open terminal/cmd and run the commands
```
$ ollama run llama3.2
```
Wait till it finishes the download. 
Once download finishes you can write some prompts and check if llama response.
After few queries please write `/bye`.
### clone app
```
$ git clone https://github.com/Vineet-code-31/full-stack-talking-pdf-AI.git
$ cd full-stack-talking-pdf-AI
```
### Run Server 
```
$ cd server
$ npm install
$ npm run dev
```
### Run Client 
open new terminal in full-stack-talking-pdf-AI directory
```
$ cd client
$ npm install
$ npm run dev
```

now got the browser and go to the http://localhost:5173/

## Tech stack
### Client
ReactJs, JavaScript, TypeScript, MUI component library

### Server
NodeJs, Express, multer to save PDFs, Ollama (llama3.2) open-ai
