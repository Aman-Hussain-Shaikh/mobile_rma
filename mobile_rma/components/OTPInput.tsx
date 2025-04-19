import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';

interface OTPInputProps {
  length: number;
  value?: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ 
  length = 6, 
  value = '', 
  onChange,
  disabled = false 
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Sync component with external value prop if provided
  useEffect(() => {
    if (value && value !== otp.join('')) {
      const otpArray = value.split('').slice(0, length);
      const newOtp = Array(length).fill('');
      
      otpArray.forEach((digit, index) => {
        newOtp[index] = digit;
      });
      
      setOtp(newOtp);
    }
  }, [value, length]);

  // Handle input changes
  const handleChange = (text: string, index: number) => {
    if (disabled) return;
    
    // Only allow numbers
    if (!/^\d*$/.test(text)) return;

    const newOtp = [...otp];
    
    // Handle paste of multiple digits
    if (text.length > 1) {
      const digits = text.split('').slice(0, length - index);
      
      // Fill current and subsequent inputs
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus on appropriate input after paste
      const newFocusIndex = Math.min(index + digits.length, length - 1);
      if (inputRefs.current[newFocusIndex]) {
        inputRefs.current[newFocusIndex]?.focus();
      } else {
        Keyboard.dismiss();
      }
    } else {
      // Handle single digit input
      newOtp[index] = text;
      setOtp(newOtp);
      
      // Auto-advance to next input
      if (text && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else if (text && index === length - 1) {
        inputRefs.current[index]?.blur();
        Keyboard.dismiss();
      }
    }
    
    // Notify parent component
    onChange(newOtp.join(''));
  };

  // Handle key press events (for backspace navigation)
  const handleKeyPress = (e: any, index: number) => {
    if (disabled) return;
    
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // If current input is empty and backspace pressed, move to previous input
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
      
      // Notify parent component
      onChange(newOtp.join(''));
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            otp[index] ? styles.filledInput : {},
            disabled ? styles.disabledInput : {}
          ]}
          value={otp[index]}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          maxLength={index === 0 ? length : 1} // Allow paste on first input
          keyboardType="numeric"
          textContentType="oneTimeCode" // For iOS auto-fill
          selectionColor="#9DFE01"
          editable={!disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#1F486B',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F486B',
    marginHorizontal: 5,
    backgroundColor: 'white',
    // Add inner shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filledInput: {
    borderColor: '#9DFE01',
    backgroundColor: '#1F486B',
    color: '#9DFE01',
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  }
});

export default OTPInput;