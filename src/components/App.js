import React, { Component } from 'react';
//import Web3 from "web3";
import Image from '../abis/Image.json'
import { saveAs } from 'file-saver';
import 'reactjs-popup/dist/index.css';

import './App.css';
const ipfsClient = require('ipfs-api')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
var Web3 = require('web3');

class App extends Component {

async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

async loadWeb3() {
  

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Image.networks[networkId]
    if(networkData) {
      const contract = new web3.eth.Contract(Image.abi, networkData.address)
      this.setState({ contract })
      const imageHash = await contract.methods.get().call()
      this.setState({ imageHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }


  constructor(props){
    super(props);
    this.state = {
      imageHash: '',
      contract: null,
      web3: null,
      buffer: null,
        account: null,
      upload: true
    }; 

  }
    switchtabupload = () => {
        console.log("clicked");
        this.setState({upload:true})
    }
    switchtabdownload = () => {
        console.log("clicked");
        this.setState({upload:false})
    }
  captureFile = (event)=>{
    event.preventDefault();
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () =>{
      this.setState({buffer: Buffer.from(reader.result)})
    }
  }
  onSubmitClick = async (event)=>{
      event.preventDefault()
      console.log("Submitting File");
      if(this.state.buffer){
        const file = await ipfs.add(this.state.buffer)
        const imageHash = file[0]["hash"]
        // console.log(imageHash);
        this.state.contract.methods.set(imageHash).send({from: this.state.account}).then((r)=>{
          this.setState({imageHash: imageHash})
        })
      }
  }


  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className = "title">
            Blockchain IPFS Based Cloud Storage System
            </p>
                </a>
                
            </nav>
            <br></br>
            <br></br>
            <div>
                <button className="uploadbutton" style={{ width: "50%", paddingTop: "1rem", paddingBottom: "0.5rem" }} onClick={this.switchtabupload}>Upload</button>
                <button className="downloadbutton" style={{ width: "50%", paddingTop: "1rem", paddingBottom: "0.5rem" }} onClick={this.switchtabdownload}>Download</button>
            </div>
        <div className="container-fluid mt-5">
                <div className="row" style={{ display: (this.state.upload) ? "block" : "none" }}>
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className ="container">
                  <img className = "photo" src={`https://ipfs.infura.io/ipfs/${this.state.imageHash}`}  alt="logo" />
                  </div>
                </a>
                            <div className="container-form">
                                
                                <h2>Choose the File</h2>
                <form>
                  <input type="file" onChange={this.captureFile}></input>
                  <input type="submit" onClick={this.onSubmitClick}></input>
                </form>
                                <p>&nbsp;</p>
                                
                                <h2> Hash Key : {this.state.imageHash}</h2>
                                <p>&nbsp;</p>
                                
                 
                               
                </div>
                <div>
                  <p>
            
                  {/* {this.state.account} */}
                                </p>
                                <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>
                            </div>
                           
                        </div>
                        
            </main>
                </div>
                <div className="row align-items-center justify-content-center" style={{ display: (this.state.upload) ? "none" : "flex", height:"100vh" }}>
                    <div>
                        <div>
                            <h2>Hash Value </h2>
                            <p>&nbsp;</p>

                            <input
                                type="text"
                                ref='title'
                                value={this.state.value}
                                onChange={this.handleChange} />
                            <p>&nbsp;</p>
                            <button onClick={() => saveAs(`https://ipfs.infura.io/ipfs/${this.refs.title.value}`, "image.jpg")}>Download</button>
                            <p>&nbsp;</p><p>&nbsp;</p>
                        </div>
                    </div>
                    
                </div>
        </div>
      </div>
    );
  }
}

export default App;
 