import React, { Component } from 'react'
import styled from 'styled-components'
import './App.css'
import * as Figma from 'figma-js'
import Problems from './Problems'
import { checkCode, FigmaApi } from './auth'
import FileSelect from './FileSelect'

checkCode()
const authApi = new FigmaApi({
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET
})

const Button = styled.button`
  padding: 16px;
  border: 0;
  border-radius: 4px;
`

class App extends Component {
  state = {
    client: null,
    file: null,
    fileKey: null
  }

  componentDidMount() {
    if (authApi.hasLocalToken()) this.getToken()
  }

  getToken = () => {
    authApi.getOAuth2Token().then(accessToken => {
      this.setState({ client: Figma.Client({ accessToken }) })
    })
  }

  getFile = fileKey => {
    this.state.client.file(fileKey).then(({ data }) => {
      console.log('FILE', data)
      this.setState({ file: data, fileKey: fileKey })
    })
  }

  postComment = node => {
    const { fileKey, client } = this.state
    const x = 0
    const y = 0
    client
      .postComment(fileKey, {
        message: '[MARK]',
        client_meta: { node_id: node.id, node_offset: { x, y } }
      })
      .then(res => console.log('POSTED', res))
  }

  render() {
    const { file, client } = this.state

    return (
      <div className="App">
        <header className="App-header">
          {client && <FileSelect file={file} onSelect={this.getFile} />}

          {file && (
            <Problems
              file={file}
              onMarkWithComment={node => this.postComment(node)}
            />
          )}

          {!client && (
            <Button className="btn" onClick={this.getToken}>
              LOGIN
            </Button>
          )}
        </header>
      </div>
    )
  }
}

export default App
