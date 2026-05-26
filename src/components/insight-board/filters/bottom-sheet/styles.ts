import {
  StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  sheetWrapper: {
    width: '100%',
    maxHeight: '85%',
    padding: 0,
    overflow: 'hidden',
  },

  sheet: {
    height: '100%',
    padding: 24,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    margin: 0,
    justifyContent: 'center',
  },

  handle: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C7C5',
    alignSelf: 'center',
    marginBottom: 16,
  },

  field: {
    marginTop: 16,
  },

  error: {
    color: 'red',
    marginTop: 4,
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },

  button: {
    flex: 1,
  },
});
