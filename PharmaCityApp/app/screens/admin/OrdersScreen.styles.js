import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },

  // TABS STYLES
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabsScrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 4,
    borderRadius: 24,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2196f3',
    fontWeight: '600',
  },
  tabActiveIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#2196f3',
    borderRadius: 1.5,
  },

  // SEARCH STYLES
  searchRow: {
    backgroundColor: 'white',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
    padding: 4,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 80,
    color: '#ccc',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // LIST
  listContainer: {
    flex: 1,
  },

  // CARD STYLES
  card: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderCode: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  cardBody: {
    padding: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  customerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  textCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dot: {
    color: '#ccc',
    marginHorizontal: 8,
  },
  phoneIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  textPhone: {
    fontSize: 14,
    color: '#666',
  },
  itemsWrapper: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196f3',
    marginLeft: 8,
  },
  textItemMore: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    elevation: 1,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});