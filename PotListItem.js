// @flow
import React from 'react';
import {Pot} from './Pot.js';

type PotListItemProps = {
  pot: Pot,
}
export default class PotListItem extends React.Component {
  render() {
    return <Text>{this.props.pot.title}: {this.props.pot.uuid} thrown on {this.props.pot.status.thrown}</Text>
  }
}
