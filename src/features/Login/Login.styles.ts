import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#00A8CC'
    },
    headingText: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 32
    },
    inputText: {
        borderWidth: 1,
        borderColor: '#06bbf8',
        padding: 16,
        paddingHorizontal: 20,
        color: '#000',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        fontSize: 18,
        marginBottom: 6
    },
    loginBtn: {
        backgroundColor: '#424079',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    errors: {
        color: 'red',
        marginBottom: 16
    },
    message: {
        marginBottom: 12,
        fontSize: 14,
        textAlign: 'center',
    },
    successText: {
        color: 'green',
    },
    errorText: {
        color: 'red',
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#06bbf8',
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    showHide: {
        color: '#007AFF',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    iconBtn: {
        paddingHorizontal: 12,
        height: 56,
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderColor: '#06bbf8',
    },
})