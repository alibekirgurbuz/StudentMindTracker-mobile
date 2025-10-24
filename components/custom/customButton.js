import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  iconName,
  iconSize = 20,
  iconColor = '#fff',
  buttonStyle,
  textStyle,
  gradientColors = ['#667eea', '#764ba2'],
  disabledColors = ['#a5a5a5', '#8a8a8a'],
  activeOpacity = 0.8,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const colors = isDisabled ? disabledColors : gradientColors;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled, buttonStyle]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={activeOpacity}
      {...props}
    >
      <LinearGradient
        colors={colors}
        style={styles.buttonGradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {iconName && (
              <Ionicons 
                name={iconName} 
                size={iconSize} 
                color={iconColor}
                style={styles.buttonIcon}
              />
            )}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CustomButton;
