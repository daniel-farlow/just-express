import React, { Component } from 'react';
import axios from 'axios';



class FileForm extends Component {

  handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Form Submitted");
    // normally for a text field you would use .value
    // but input boxes that are files do not have a value property
    // they have a files property
    // and the files property will be an array for every file that is submitted with the form
    const file = document.getElementById('file-field').files[0];
    const file2 = document.getElementById('file-field').files[0];
    // console.log(file)
    const url = 'http://localhost:3000/uploadFiles';
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    const data = new FormData();
    data.append('meme', file);
    data.append('meme', file2);
    // console.log(data); // <-- doesn't actually log anything to the console
    // for (let pair of data.entries()) {  // <-- use this instead to log to the console
    //   console.log(pair[0])
    //   console.log(pair[1])
    // }

    let ourData = await axios.post(url, data, config);
    console.log(ourData.data);
  }

  render() {
    return (
      <div>
        <h1>Sanity Check</h1>
        <form onSubmit={this.handleSubmit}>
          <input id="file-field" type="file" name="meme" />
          <input id="file-field2" type="file" name="meme" />
          <input type="submit" name="submit" />
        </form>
      </div>
    )
  }
}

export default FileForm;