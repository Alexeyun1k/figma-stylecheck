import React, { Component } from 'react'
import styled from 'styled-components'
import color from 'tinycolor2'

const Button = styled.button`
  padding: 16px;
  border: 0;
  border-radius: 4px;
`
const Body = styled.div`
  padding: 16px;
  border: 0;
  border-radius: 4px;
`

const Input = styled.input`
  padding: 16px;
  border: 0;
  border-radius: 4px;
  margin-right: 8px;
  width: 300px;
`
const Thumbnail = styled.img`
  width: auto;
  height: 160px;
  background: ${({ bg }) => bg || '#fff'};
  border-radius: 8px;
  padding: 8px;
  margin-top: 24px;
`

export default class FileSelect extends Component {
  state = {
    inputValue: ''
  }

  inputChange = e => {
    this.setState({ inputValue: e.target.value })
  }
  handlePaste = e => {
    this.setState(
      { inputValue: e.clipboardData.getData('Text') },
      this.checkFile
    )
  }
  checkFile = () => {
    this.props.onSelect(getKeyfromString(this.state.inputValue))
  }

  render() {
    const file = this.props.file
    const inputValue = this.state.inputValue
    const bg = file
      ? color.fromRatio(file.document.children[0].backgroundColor).toRgbString()
      : '#fff'

    return (
      <Body>
        {file && <Thumbnail bg={bg} src={file.thumbnailUrl} alt="thumbnail" />}
        {!file && (
          <div>
            <Input
              value={inputValue}
              onChange={this.inputChange}
              onPaste={this.handlePaste}
            />
            <Button className="btn" onClick={this.checkFile}>
              Check file
            </Button>
          </div>
        )}
      </Body>
    )
  }
}

function getKeyfromString(string) {
  if (string && string.indexOf('figma.com/file/') + 1) {
    const arr = string.split('/')
    const index = arr.indexOf('file') + 1
    return arr[index]
  }
  return string
}
