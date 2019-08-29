
import React from 'react';
import { 
  Dimensions,
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  TextInput,
  Modal
} from 'react-native';


import { AppRegistry } from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';

import {Card} from 'native-base';

import {salesService} from '../../../services/salesService';

import _ from 'lodash';

import moment from 'moment';

import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';


const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

export default class ModalAddProduct extends React.Component {
  constructor() {
    super();
    this.state = {
        amount: null,
        quantity: null,
        isGrams: false,
        amountInputEditable: true,
        showPlusAndMinorQuantity: true,
        quantityInputEditable: true
    };

    this.products= [];
    

    
  }


  async componentDidMount() {
    const product = this.props.product;
    console.log('pro', this.props.product)

    this.setInitialData(this.props.product);

    
  }

  setInitialData (product) {
    const quantity = 1;
    const amount = quantity * parseInt(product.price);

    this.setState({quantity: quantity.toString(), amount: amount.toString()});

    if(product.um) {
      if(product.um == 'gramos') {
        const amount = parseFloat(product.price) * 1000;
        console.log(parseFloat(product.price));
        console.log(amount)
        this.setState({quantityInputEditable: false, showPlusAndMinorQuantity: false, amountInputEditable: true, isGrams: true, amount: amount.toString(), quantity: '1000'});
      } else {
        console.log('here')
        this.setState({amountInputEditable: false});
      }
      
    } else {
      console.log('aqui')
      this.setState({showPlusAndMinorQuantity: true, amountInputEditable: false});
    }
  }

  componentWillReceiveProps (props) {
    console.log('update prop', props)
    if(props.isVisible) {
      this.setInitialData(props.product);
    } else {
      this.setState({
        amount: null,
        quantity: null
      })
    }
 
  }


  async saveSale () {
      const sale = {
        quantity: parseInt(this.state.quantity),
        salePriceGross: parseInt(this.state.amount),
        updatedAt: moment().format('YYYY-MM-DD'),
        createdAt: moment().format('YYYY-MM-DD'),
        productName: this.props.product.productName
      }

      await salesService.create(sale);

      this.props.closeModal();
  }

  closeModal () {
    console.log('close')
    this.setState({
      amount: null,
      quantity: null
    })
    
    this.props.closeModal();
  }

  minusQuantity () {
    let quantity = parseInt(this.state.quantity);
    quantity--;
    let amount = parseInt(this.props.product.price) * quantity;
    this.setState({quantity: quantity.toString(), amount: amount.toString()});
  }

  plusQuantity () {
    let quantity = parseInt(this.state.quantity);
    quantity++;
    let amount = parseInt(this.props.product.price) * quantity;
    this.setState({quantity: quantity.toString(), amount: amount.toString()});
  }



  render() {
    const quantityTitle = this.state.isGrams ? 'Cantidad (gramos)': 'Cantidad (unidades)';
    return (
        <Modal 
        animationType="slide"
        style={{flex:1}}
        visible={this.props.isVisible}
        onRequestClose={() => {
          console.log('close')
          this.setState({
            amount: null,
            quantity: null
        })
      }}
        >
            <LinearGradient colors={['#4dd0e1', '#18ffff']} style={{flexDirection: 'row', flexGrow: 0.1, justifyContent: 'flex-end', alignItems: 'center'}} start={[0, 0]} end={[0.6, 0]}>
                <TouchableOpacity onPress={() => this.closeModal()}>
                    <MaterialIcons style={{ fontSize: 30, color: '#fff', marginRight: 20}} name={'close'} />
                </TouchableOpacity>
               
            </LinearGradient>

            <View style={{flex:1, padding: 10}}>

              <View style={{flex:0.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> 
                <Text style={{fontFamily: 'Roboto', fontSize: 16}}>{quantityTitle}</Text>
              </View>

                <View style={{flex:0.5, flexDirection: 'row'}}>
                   {
                     this.state.showPlusAndMinorQuantity ? (
                      <TouchableOpacity style={{flex:1, justifyContent: 'center', alignItems: 'center'}} onPress={this.minusQuantity.bind(this)}>
                          <MaterialCommunityIcons style={{fontSize: 22}} name={'minus'}/>
                      </TouchableOpacity>
                     ) : null
                   }
                    
                    <Card style={{flex: 2, justifyContent: 'center', alignItems: 'center'}}>
                        <TextInput
                        editable={this.state.quantityInputEditable}
                        style={{flex: 1,padding: 5, width: 50, justifyContent: 'center', alignItems: 'center'}}
                          onChangeText={(quantity) => this.setState({quantity})}
                          value={this.state.quantity}
                          placeholder={"Cantidad"}
                        />

                    
                    </Card>

                    {
                     this.state.showPlusAndMinorQuantity ? (
                      <TouchableOpacity style={{flex:1, justifyContent:'center', alignItems: 'center'}} onPress={this.plusQuantity.bind(this)}>
                          <MaterialCommunityIcons style={{fontSize: 22}} name={'plus'}/>
                    </TouchableOpacity>
                     ) : null
                   }

                    
                </View>

                <View style={{flex:0.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> 
                  <Text style={{fontFamily: 'Roboto', fontSize: 16}}>Precio</Text>
                </View>

                <View style={{flex:0.5}}>
                    <Card style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <TextInput
                        editable={this.state.amountInputEditable}
                            style={{flex: 1, padding: 10, width:100, alignItems: 'center', justifyContent: 'center', flexDirection:'row'}}
                            onChangeText={(amount) => {
                              let quantity = 0;
                              if(this.state.isGrams) {
                                
                                quantity = Math.round( amount / parseFloat(this.props.product.price) );
                              }
                              console.log(quantity);
                              this.setState({amount, quantity: quantity.toString()});
                            }
                            }
                            value={this.state.amount}
                            placeholder={"Monto"}
                        />
                    </Card>
                </View>

                <View style={{flex:2, justifyContent: 'flex-end'}}>
                    <TouchableOpacity onPress={() => this.saveSale()}>
                        <LinearGradient colors={['#4dd0e1', '#18ffff']} style={{height: 80, flexDirection: 'row', flexGrow: 1, justifyContent: 'center', alignItems: 'center', marginBottom:10}} start={[0, 0]} end={[0.6, 0]}>
                            <Text style={{color: '#fff', fontSize: 20, fontFamily: 'Roboto_medium'}}>Vender</Text>
                        </LinearGradient>

                    </TouchableOpacity>
                </View>


            </View>
           

        </Modal>
    )

}

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  textinput: {
    flex: 1
  }
  
 
});
