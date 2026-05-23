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
    maxHeight: 700,
  },

  handle: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C4C7C5',
    alignSelf: 'center',
    marginBottom: 16,
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },

  // KPI ROW
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  kpiCard: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgb(73, 69, 79)',
    borderRadius: 16,
    padding: 16,

    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  kpiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },

  kpiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },

  // CHART CARD
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
    marginBottom: 20,
  },

  // FUNNEL
  funnelContainer: {
    gap: 16,
  },

  funnelItem: {
    width: '100%',
  },

  funnelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  funnelLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  funnelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  funnelBarBackground: {
    width: '100%',
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },

  funnelBarFill: {
    height: '100%',
    borderRadius: 999,
  },

  // DONUT LEGEND
  legendContainer: {
    marginTop: 12,
    gap: 10,

    position: 'absolute',
    right: 0,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 8,
  },

  legendText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },

  // INSIGHTS OVER TIME
  insightsChartCard: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 3,
    paddingTop: 16,
    marginTop: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
    overflow: 'hidden',
  },

  insightsSectionTitle: {
    paddingLeft: 4,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});