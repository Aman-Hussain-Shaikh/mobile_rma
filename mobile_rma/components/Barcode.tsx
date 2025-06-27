import React from 'react';
import { View, Text } from 'react-native';
import Barcode from 'react-native-barcode-svg';

interface BarcodeProps {
    value: string;
    width?: number;
    height?: number;
    format?: string;
    displayValue?: boolean;
    lineColor?: string;
    textColor?: string;
    backgroundColor?: string;
}

const BarcodeCode: React.FC<BarcodeProps> = ({
    value,
    width = 2,
    height = 100,
    format = 'CODE128',
    displayValue = true,
    lineColor = '#000000',
    textColor = '#000000',
    backgroundColor = '#FFFFFF',
}) => {
    if (!value) {
        return (
            <View style={{ backgroundColor, padding: 10, alignItems: 'center' }}>
                <Text style={{ color: textColor }}>Invalid barcode value</Text>
            </View>
        );
    }

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
                lineColor={lineColor}
                background={backgroundColor}
            />;
            {displayValue && (
                <Text style={{
                    color: textColor,
                    fontSize: 12,
                    marginTop: 5,
                    fontFamily: 'monospace'
                }}>
                    {value}
                </Text>
            )}
        </View>
    );
};

export default BarcodeCode;