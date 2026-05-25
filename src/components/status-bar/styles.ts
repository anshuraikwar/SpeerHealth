
import {
  StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
  // STATUS BAR
  wrapper: {
    backgroundColor: "#3F51B5",
  },
  container: {
    padding: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBar: {
    height: 32,
    display: 'flex',
    justifyContent: 'center',
  },
  avatar: {
    height: 32,
    width: 32,
    backgroundColor: 'gray',
    borderRadius: 999,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',
  },
  avatarsInitials: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    zIndex: -1,
  },
  avatarsOverflow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    zIndex: -1,
  },

  // ONLINE USERS BOTTOM SHEET
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.50)',
  },

  sheetWrapper: {
    width: '100%',
  },

  sheet: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    paddingTop: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: 300,
  },

  handle: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C7C5',
    alignSelf: 'center',
    marginBottom: 16,
  },
});
