import {
  StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  tabContent: {
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 4,

    flexDirection: 'column',
    alignItems: 'center',

    position: 'relative',
  },
  bottomBar: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 12,
    paddingTop: 4,

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  unreadNotificationsBadge: {
    position: 'absolute',
    right: "35%",
    height: 14,
    width: 14,
    borderRadius: 999,
    backgroundColor: 'red',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});