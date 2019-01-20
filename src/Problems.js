import React, { Component } from 'react'
import styled from 'styled-components'
import { getFlatList } from './utils'

const Problem = styled.section`
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  margin-top: 4px;
  color: #000;
  text-align: left;
`
const Button = styled.button`
  margin-left: 8px;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid transparent;
  color: hsla(200, 100%, 50%, 1);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    border: 1px solid hsla(200, 100%, 50%, 1);
  }
  &:active {
    border: 1px solid hsla(200, 100%, 20%, 1);
  }
`
const Secondary = styled.span`
  color: hsla(0, 0%, 0%, 0.4);
  font-size: 12px;
`

export default class Problems extends Component {
  state = {}

  handleMark = node => e => {
    this.props.onMarkWithComment(node)
  }

  render() {
    const nodes = getFlatList(this.props.file.document).filter(
      node => node.type === 'TEXT' && (!node.styles || !node.styles.fill)
    )
    console.log('NODES', nodes)

    return (
      <div>
        Text elements without color style: {nodes.length}
        {nodes.map(node => (
          <Problem key={node.id}>
            {node.characters}
            <br />
            <Secondary>
              {node.name} ({node.id})
            </Secondary>
            <Button onClick={this.handleMark(node)}>Mark with comment</Button>
          </Problem>
        ))}
      </div>
    )
  }
}
