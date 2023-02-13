import { keymap } from "prosemirror-keymap"
import { Transform, StepMap } from "prosemirror-transform"
import { EditorState, Plugin, Selection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser } from "prosemirror-model"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap } from "prosemirror-commands"
import TagsView from "./tags"
import GalleryView from "./gallery"
import EquationView from "./equation"
import { gapCursor } from "prosemirror-gapcursor"
import textSchema from "./textschema"
import EquationManager from "./equation_manager"
import InlineEquationView from "./inline_equation"
import EquationRefView from "./equation_ref"

let equationManager = new EquationManager();


function popup(content) {
  let exisiting = document.getElementById('limpid-popup-backdrop');

  if (exisiting) {
    exisiting.parentNode.removeChild(exisiting);
  }

  let backdrop = document.createElement('div');
  backdrop.id = 'limpid-popup-backdrop';
  document.body.appendChild(backdrop);

  let dialog = document.createElement('div');
  dialog.className = 'limpid-popup-dialog';
  backdrop.appendChild(dialog);

  let closeButton = document.createElement('button');
  closeButton.innerText = "Close";
  dialog.appendChild(closeButton);

  closeButton.onclick = (e) => {
    backdrop.parentNode.removeChild(backdrop);
  }

  dialog.appendChild(content);
}


function menuPlugin() {
  return new Plugin({
    filterTransaction(tr, state) {
      console.log(tr)
      return true;
    },
    view(editorView) {
      let menuView = document.createElement('div');
      menuView.style.zIndex = 100;
      menuView.style.position = 'fixed';
      menuView.style.left = 'calc(50% - 480px)';
      menuView.style.display = 'flex';
      menuView.style.flexDirection = 'column';

      let imageButton = document.createElement('button');

      imageButton.id = 'image';
      imageButton.innerText = "Im"

      imageButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.gallery.create()));
      }

      let equationButton = document.createElement('button');

      equationButton.id = 'equation';
      equationButton.innerText = "Eq"

      equationButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.equation.create()));
      }

      let inlineEquationButton = document.createElement('button');

      inlineEquationButton.id = 'equation';
      inlineEquationButton.innerText = "IEq"

      inlineEquationButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.inline_equation.create()));
      }

      menuView.appendChild(imageButton);
      menuView.appendChild(equationButton);
      menuView.appendChild(inlineEquationButton);

      let showSelector = document.createElement('button');

      showSelector.id = 'show';
      showSelector.innerText = "SE";

      showSelector.onclick = (e) => {
        e.preventDefault();

        let exisiting = document.getElementById('limpid-equation-ref-selector');

        if (exisiting) {
          exisiting.parentNode.removeChild(exisiting);
        }

        let container = document.createElement('div');
        container.classList.add('limpid-equation-ref-selector');

        equationManager.assembleSelector(container, (equationKey) => {
          console.log("insert equation ref", equationKey)

          let exisiting = document.getElementById('limpid-popup-backdrop');
          if (exisiting) {
            exisiting.parentNode.removeChild(exisiting);
          }

          e.preventDefault();
          window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.equation_ref.create({
            id:
              equationKey
          })));
        });

        popup(container);
      }

      menuView.appendChild(showSelector);


      editorView.dom.parentNode.insertBefore(menuView, editorView.dom);
      return menuView;
    }
  })
}

let editorElm = document.querySelector("#editor");

window.editorView = new EditorView(editorElm, {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('<h1>test</h1><tags></tags>'),
    plugins: [

      keymap(baseKeymap),
      gapCursor(),
      menuPlugin()
    ]
  }),
  nodeViews: {
    tags(node, view, getPos) { return new TagsView(node, view, getPos) },
    gallery(node, view, getPos) { return new GalleryView(node, view, getPos) },
    equation(node, view, getPos) { return new EquationView(node, view, getPos, equationManager) },
    inline_equation(node, view, getPos) { return new InlineEquationView(node, view, getPos) },
    equation_ref(node, view, getPos) {
      return new EquationRefView(node, view, getPos, equationManager)
    }
  },
  /*dispatchTransaction: (tr) => {    
    const state = window.editorView.state.apply(tr);
    window.editorView.updateState(state);
   
  }*/
})

editorElm.onclick = (e) => {
  if (e.target !== editorElm) {
    return;
  }
  e.preventDefault();


  let lastNode = window.editorView.state.doc.lastChild;
  let rpos = window.editorView.state.doc.resolve(window.editorView.state.doc.nodeSize - 2);
  let selection = Selection.near(rpos, 1)
  console.log("last sel", lastNode, rpos, selection)
  let tr = window.editorView.state.tr.setSelection(selection).scrollIntoView()
  setTimeout(() => {
    window.editorView.dispatch(tr)
    window.editorView.focus()
  }, 100);

  e.stopImmediatePropagation();
  e.stopPropagation();
}