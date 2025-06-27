// Install: npm install react-native-barcode-builder
// or: yarn add react-native-barcode-builder

import React from 'react';
import { View, Text } from 'react-native';
import Barcode from 'react-native-barcode-builder';

interface BarcodeSvgProps {
    value: string;
    width?: number;
    height?: number;
    format?: string;
    displayValue?: boolean;
    lineColor?: string;
    textColor?: string;
    backgroundColor?: string;
}

const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
    value,
    width = 2,
    height = 100,
    format = 'CODE128',
    displayValue = true,
    lineColor = '#000000',
    textColor = '#000000',
    backgroundColor = '#FFFFFF',
}) => {
    return (
        <View style={{
            backgroundColor,
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Barcode
                value={value}
                format={format}
                width={width}
                height={height}
                displayValue={displayValue}
                lineColor={lineColor}
                textColor={textColor}
                background={backgroundColor}
            />
        </View>
    );
};

export default BarcodeSvg;

// Alternative: If you can't install external libraries, here's a pure React Native solution
// that creates a simple barcode-like pattern:

export const SimpleBarcodePattern: React.FC<BarcodeSvgProps> = ({
    value,
    width = 2,
    height = 100,
    displayValue = true,
    lineColor = '#000000',
    textColor = '#000000',
    backgroundColor = '#FFFFFF',
}) => {
    // Generate a simple pattern based on the string
    const generatePattern = (text: string) => {
        let pattern = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            // Create alternating pattern based on character codes
            pattern += (charCode % 2 === 0 ? '110' : '101');
        }
        return pattern + '11'; // Add end marker
    };

    const pattern = generatePattern(value);
    const barWidth = width;
    const totalWidth = pattern.length * barWidth;

    return (
        <View style={{
            backgroundColor,
            padding: 10,
            alignItems: 'center'
        }}>
            <View style={{
                flexDirection: 'row',
                height: height,
                alignItems: 'flex-end'
            }}>
                {pattern.split('').map((bit, index) => (
                    <View
                        key={index}
                        style={{
                            width: barWidth,
                            height: bit === '1' ? height : height * 0.7,
                            backgroundColor: bit === '1' ? lineColor : backgroundColor,
                        }}
                    />
                ))}
            </View>
            {displayValue && (
                <Text style={{
                    color: textColor,
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 5
                }}>
                    {value}
                </Text>
            )}
        </View>
    );
};