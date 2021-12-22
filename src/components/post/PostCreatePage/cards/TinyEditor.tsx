import React, { useRef, useState, FunctionComponent, useEffect } from "react";
import MUIRichTextEditor, {
  TMUIRichTextEditorRef,
  TAsyncAtomicBlockResponse,
} from "mui-rte";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import BackupIcon from "@mui/icons-material/Backup";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { convertToRaw } from "draft-js";
import { useForm, Controller } from "react-hook-form";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// import { Editor } from "@tinymce/tinymce-react";
import tinymce from "tinymce/tinymce";
import {url} from "inspector";

//Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDgrrJN3aVUu4zLjQ_go6cUtfcPAOyR0bE",
  authDomain: "sead-c470a.firebaseapp.com",
  databaseURL:
    "https://sead-c470a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sead-c470a",
  storageBucket: "sead-c470a.appspot.com",
  messagingSenderId: "431948638881",
  appId: "1:431948638881:web:6f352458ae3a211539dee0",
  measurementId: "G-B8TSFYDFVE",
};

interface IUploadImagePopoverProps {
  anchor: TAnchor;
  onSubmit: (data: TUploadImageData, insert: boolean) => void;
}

interface IRichTextEditorProps {
  content: string;
  updatePostContent: (arg: string) => void;
}

type TUploadImagePopoverState = {
  anchor: TAnchor;
  isCancelled: boolean;
};

type TUploadImageData = {
  file?: File;
};

type TAnchor = HTMLElement | null;

const cardPopverStyles = makeStyles({
  root: {
    padding: 10,
    maxWidth: 350,
  },
  textField: {
    width: "100%",
  },
  input: {
    display: "none",
  },
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();
const uploadImageToServer = async (file: File) => {
  return new Promise((resolve) => {
    console.log(`Uploading image ${file.name} ...`);
    setTimeout(() => {
      const spaceRef = ref(storage, `images/${file.name}`);

      const uploadTask = uploadBytesResumable(spaceRef, file);
      //
      //initiates the firebase side uploading
      uploadTask.on(
        "state_changed",
        (snapShot: any) => {
          //takes a snap shot of the process as it is happening
          console.log(snapShot);
        },
        (err: any) => {
          //catches the errors
          console.log(err);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          });
        }
      );
      console.log("Upload successful");
    }, 2000);
  });
};

const uploadImage = async (file: File) => {
    const url = await uploadImageToServer(file);
    if (!url) {
      return;
    }
    console.log("uploadImage")
    return url;
};

const UploadImagePopover: FunctionComponent<IUploadImagePopoverProps> = (
  props
) => {
  const classes = cardPopverStyles(props);
  const [state, setState] = useState<TUploadImagePopoverState>({
    anchor: null,
    isCancelled: false,
  });
  const [data, setData] = useState<TUploadImageData>({});

  useEffect(() => {
    setState({
      anchor: props.anchor,
      isCancelled: false,
    });
    setData({
      file: undefined,
    });
  }, [props.anchor]);

  return (
    <Popover
      anchorEl={state.anchor}
      open={state.anchor !== null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <Grid container spacing={1} className={classes.root}>
        <Grid item xs={10}>
          <TextField
            className={classes.textField}
            disabled
            value={data.file?.name || ""}
            placeholder="Click icon to attach image"
          />
        </Grid>
        <Grid item xs={2}>
          <input
            accept="image/*"
            className={classes.input}
            id="contained-button-file"
            type="file"
            onChange={(event) => {
              setData({
                ...data,
                file: event.target.files![0],
              });
            }}
          />
          <label htmlFor="contained-button-file">
            <IconButton
              color="primary"
              aria-label="upload image"
              component="span"
            >
              <AttachFileIcon />
            </IconButton>
          </label>
        </Grid>
        <Grid item container xs={12} justifyContent="flex-end">
          <Button
            onClick={() => {
              setState({
                anchor: null,
                isCancelled: true,
              });
            }}
          >
            <CloseIcon />
          </Button>
          <Button
            onClick={() => {
              setState({
                anchor: null,
                isCancelled: false,
              });
              props.onSubmit(data, !state.isCancelled);
            }}
          >
            <DoneIcon />
          </Button>
        </Grid>
      </Grid>
    </Popover>
  );
};
const defaultValues = {
  RTE1: "",
};
const TinyEditor: React.FC<IRichTextEditorProps> = ({
  content,
  updatePostContent,
}) => {
  const ref = useRef<TMUIRichTextEditorRef>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  // parent params
  const [postContent, setPostContent] = useState<string>("");

  // const handleFileUpload = (file: File) => {
  //   ref.current?.insertAtomicBlockAsync(
  //     "IMAGE",
  //     uploadImage(file),
  //     "Uploading now..."
  //   );
  //   console.log(file);
  // };

  //Firebase helper
  const handleFireBaseUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("start of upload");
    // async magic goes here...
  };

  //////////////////////////////////-- /////////////////////////////////////////////////////////////////
  useEffect(() => {
    setPostContent(content);
    var rte = document.getElementById("muirte") as HTMLFormElement;
    console.log("rte=", rte);
  }, [content]);
  const myTheme = createTheme({
    // Set up your custom MUI theme here
  });

  const { handleSubmit, reset, register, setValue } = useForm({
    defaultValues,
  });

  // const editorRef = useRef<HTMLDivElement>(null);
  // const log = () => {
  //   if (editorRef.current) {
  //     console.log(editorRef.current.getContent());
  //   }
  // };

  const handleEditorChange = (content: any, editor: any) => {
    console.log("Content was updated:", content);
  };
  tinymce.init({
    selector: '#tinyEditor',
    statusbar: false,
    plugins: [
      "advlist autolink lists link image charmap print preview anchor",
      "searchreplace visualblocks code fullscreen textcolor ",
      "insertdatetime media table paste code help wordcount",
    ],
    toolbar: 'undo redo | image code',
    image_title: true,
    file_picker_types: 'image',
    images_upload_url: 'postAcceptor.php',
    convert_urls: false,
    async: true,

    file_picker_callback: function (cb, value, meta) {
      var input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      /*
        Note: In modern browsers input[type="file"] is functional without
        even adding it to the DOM, but that might not be the case in some older
        or quirky browsers like IE, so you might want to add it to the DOM
        just in case, and visually hide it. And do not forget do remove it
        once you do not need it anymore.
      */
      input.onchange = async function () {
        if (input.files !== null) {
          var file = input.files[0];
          var reader = new FileReader();
          reader.onload = await async function () {
            /*
              Note: Now we need to register the blob in TinyMCEs image blob
              registry. In the next release this part hopefully won't be
              necessary, as we are looking to handle it internally.
            */
            var id = 'blobid' + (new Date()).getTime();
            var blobCache = tinymce.activeEditor.editorUpload.blobCache;
            // @ts-ignore
            var base64 = reader.result.split(',')[1];
            var blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);

            //upload file to server
            uploadImage(file) //Promise here
              .then(url => {
                console.log("url",url)
                cb(url, { title: file.name });
              })
            /* call the callback and populate the Title field with the file name */

          };
          await reader.readAsDataURL(file);

        }

      };
      input.click();
    },
    setup: function (ed: any) {
      ed.on('change', function (e: any) {
        console.log('the event object ', e);
        console.log('the editor object ', ed);
        console.log('the content ', ed.getContent());
      });
    }
  });

  const onChangeHandler = (inst: any) => {
    console.log("Some one modified something");
    console.log("The HTML is now:" + inst.getBody().innerHTML);
  }

  return (
    <div>
      <textarea id="tinyEditor">Hello, World!</textarea>
      {/* <textarea id="tinyEditor" value={data} onChange={() => console.log(tinymce.get("tinyEditor").getContent())}>Hello, World!</textarea> */}

      {/* <Editor
        apiKey="6p92ky39gv2q8cy92nl4mrnkdlrm7s3uqy5mjzbvgxa8nvvk"
        // tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
        initialValue="<p>This is the initial content of the editor</p>"
        init={{
          skin: "snow",
          icons: "thin",
          placeholder: "Ask a question or post an update...",
          statusbar: false,

          height: 400,
          menubar: true,
          plugins: [
            "advlist autolink lists link image charmap print preview anchor",
            "searchreplace visualblocks code fullscreen textcolor ",
            "insertdatetime media table paste code help wordcount",
          ],
          textcolor_rows: "4",

          toolbar:
            "undo redo | styleselect | fontsizeselect| code | bold italic | alignleft aligncenter alignright alignjustify | outdent indent ",
        }}
        onEditorChange={handleEditorChange}
        outputFormat="html"
      /> */}
    </div>
  );
};
export default TinyEditor;
