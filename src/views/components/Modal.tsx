import React from 'react';
import { Modal as RNModal, Text, View } from 'react-native';
import Button from 'react-native-button';
import ElevatedView from 'react-native-elevated-view';
import styles from '../../style';

interface ModalProps {
  header: string;
  body: JSX.Element;
  buttons: Array<{ text: string; onPress?: () => void; disabled?: boolean }>;
  open: boolean;
  close: () => void;
}

export default class Modal extends React.Component<ModalProps> {
  public render() {
    return (
      <RNModal
        transparent={true}
        visible={this.props.open}
        onRequestClose={this.props.close}
        onDismiss={this.props.close}
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
            <Text style={styles.modalHeader}>{this.props.header}</Text>
            {this.props.body}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              {this.props.buttons.map(({ text, onPress, disabled }) => (
                <Button
                  onPress={() => {
                    this.props.close();
                    onPress && onPress();
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
}
