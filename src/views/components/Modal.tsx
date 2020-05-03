import React from 'react';
import { Modal as RNModal, Text, TouchableWithoutFeedback, View } from 'react-native';
import Button from 'react-native-button';
import ElevatedView from 'react-native-elevated-view';
import style from '../../style';

export interface ButtonProp {
  text: string;
  onPress?: () => void;
  close: boolean; // should the button close the modal
  disabled?: boolean;
}

interface ModalProps {
  header: string;
  body: JSX.Element;
  buttons: ButtonProp[];
  open: boolean;
  close: () => void;
  cancelable: boolean;
}

export default function Modal(props: ModalProps) {
  const onTouchOutside = () => props.cancelable && props.close();
  const ignoreTouch = () => true;
  const buttons = props.buttons.map(({ text, onPress, disabled, close }) => {
    const onButtonPress = () => {
      if (onPress) {
        onPress();
      }
      if (close) {
        props.close();
      }
    };
    const buttonStyles = [
      style.s.button3,
      style.s.modalButton,
      disabled ? style.s.disabledButton : null,
    ];
    return (
      <Button
        onPress={onButtonPress}
        style={buttonStyles}
        key={text}
        disabled={!!disabled}
      >
        {text}
      </Button>
    );
  });
  return (
    <RNModal
      transparent={true}
      visible={props.open}
      onRequestClose={props.close}
    >
      <TouchableWithoutFeedback onPress={onTouchOutside}>
        <View style={style.s.modalBackground}>
          <TouchableWithoutFeedback style={style.s.modalTouchable} onPress={ignoreTouch}>
            <ElevatedView style={style.s.modal} elevation={24}>
              <Text style={style.s.modalHeader}>{props.header}</Text>
              {props.body}
              <View style={style.s.modalButtonBox}>
                {buttons}
              </View>
            </ElevatedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
