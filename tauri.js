let tauri =  window.__TAURI__;

console.log(tauri);

(async () => {
const files = await tauri.dialog.open({
  multiple: true,
  filters: [{
    name: 'Image',
    extensions: ['png', 'jpeg']
  }]
});

console.log("selected", files)

let apiPath = window.__TAURI__.tauri.convertFileSrc(files[0])
console.log('API Path', apiPath)
let img = document.createElement('img');
img.src = apiPath
document.body.appendChild(img)
})();