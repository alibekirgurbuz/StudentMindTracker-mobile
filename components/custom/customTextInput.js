import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomTextInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  iconName,
  showPassword = false,
  onTogglePassword,
  onFocus,
  onBlur,
  focused = false,
  style,
  containerStyle,
  inputStyle,
  placeholderTextColor = '#333',
  ...props
}) => {
  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <View style={[styles.inputWrapper, focused && styles.inputFocused, style]}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={focused ? "#49b66f" : "#999"}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        {onTogglePassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 15,
    height: 56,
  },
  inputFocused: {
    borderColor: '#49b66f',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: '100%',
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 5,
  },
});

export default CustomTextInput;
