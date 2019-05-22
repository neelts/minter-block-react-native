/**
 * Minter Status Block Waiter
 */

import React, {Component} from 'react'
import {StyleSheet, ActivityIndicator, Text, TextInput, View, FlatList} from 'react-native'
import Swipeout from 'react-native-swipeout'
import RNMomentCountDown from 'react-native-moment-countdown'

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = { 
      isLoading: true,
      items: [],
      block: 0, time: 0,
      name:"", value:"",
      count: 0
    }
  }


  componentDidMount() {
    setInterval(() => this.updateStatus(), 5000);
    return this.updateStatus()
  }

  updateStatus() {
    return fetch('https://explorer-api.minter.network/api/v1/status').then(r => r.json()).then(
      r => {
        const time = r.data.averageBlockTime
        this.setState({
          isLoading: false,
          block: r.data.latestBlockHeight,
          time: time,
          items: this.updateItems(time)
        });
      }
    ).catch(e => console.error(e))
  }

  check() {
    if (this.state.name.length > 0 && this.state.value.length > 0) {
      console.log(this.state)
      let count = this.state.count;
      this.setState({ 
        name:"", value:"", count:count + 1,
        items:[...this.state.items, { key:count.toString(), name:this.state.name, value:this.state.value, date:new Date(), block:parseInt(this.state.value) }] })
    }
  }

  remove(item) {
    const items = [...this.state.items];
    items.splice(items.indexOf(item), 1)
    this.setState({ items:items })
  }

  updateItems(time) {
    const items = [...this.state.items];
    items.forEach(item => {
      const d = new Date()
      d.setTime(((parseInt(item.block) - this.state.block) * time * 1000) + Date.now())
      console.log(d)
      item.date = d
    })
    return items
  }

  render() {

    return this.state.isLoading ? (
      <View style={styles.loading}>
        <ActivityIndicator/>
      </View>
    ) : (
      <View style={styles.app}>
        <View style={styles.top}>
          <View style={styles.block}>
            <Text>Latest Block</Text>
            <Text>{this.state.block}</Text>
          </View>
        </View>
        <FlatList data={this.state.items} bounces={true} alwaysBounceVertical={true} renderItem={
          ({item}) => 
          <Swipeout autoClose={true} right={[{
            onPress: () => this.remove(item), text: "Delete", type: "delete"
          }]}>
            <View style={[styles.block, styles.inner]}>
              <Text>{item.name}</Text>
              <Text>{item.value}</Text>
              <RNMomentCountDown toDate={item.date} targetFormatMask="DD HH:mm:ss"/>
            </View>
          </Swipeout>
        }/>
        <View style={[styles.block, styles.inner]}>
          <TextInput value={this.state.name} style={{flex: 0.5, padding: 0}} selectTextOnFocus={true} placeholder="Name" onEndEditing={() => this.check()} onChangeText={(text) => this.setState({name:text})}/>
          <TextInput value={this.state.value} style={{flex: 0.5, padding: 0, textAlign: "right"}} selectTextOnFocus={true} keyboardType="numeric" placeholder="Block" onEndEditing={() => this.check()} onChangeText={(text) => this.setState({value:text})}/>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    padding: 20
  },
  app: {},
  top: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    elevation: 5
  },
  block: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white'
  },
  inner: {
    elevation: 2
  }
});
