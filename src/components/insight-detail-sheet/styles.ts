
import {
  StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
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

  activityContainer: {
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: "rgb(73,69,79)",
    borderRadius: 8,
    overflow: "hidden",
  },

  headerRow: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  headerCell: {
    flex: 1,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },

  cell: {
    flex: 1,
    fontSize: 12,
    textAlign: "center",
  },

  action: {
    flex: 0.8,
  },
});
