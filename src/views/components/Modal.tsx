import React from 'react';
import { Modal as RNModal, Text, View } from 'react-native';
import Button from 'react-native-button';
import ElevatedView from 'react-native-elevated-view';
import styles from '../../style';

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
}

export default function Modal(props: ModalProps) {
  return (
    <RNModal
      transparent={true}
      visible={props.open}
      onRequestClose={props.close}
      onDismiss={props.close}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <ElevatedView style={styles.modal} elevation={24}>
          <Text style={styles.modalHeader}>{props.header}</Text>
          {props.body}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            {props.buttons.map(({ text, onPress, disabled, close }) => (
              <Button
                onPress={() => {
                  onPress && onPress();
                  close && props.close();
                }}
                style={[
                  styles.button3,
                  styles.modalButton,
                  disabled ? styles.disabledButton : null,
                ]}
                key={text}
                disabled={!!disabled}
              >
                {text}
              </Button>
            ))}
          </View>
        </ElevatedView>
      </View>
    </RNModal>
  );
}
