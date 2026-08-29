/**
 * Portal Context
 * Provides a portal system for rendering modals within the mobile app container
 * instead of the document body (which breaks out of the mobile viewport on web)
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

interface PortalContextValue {
  registerPortal: (id: string, content: ReactNode) => void;
  unregisterPortal: (id: string) => void;
}

const PortalContext = createContext<PortalContextValue | undefined>(undefined);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within PortalProvider');
  }
  return context;
};

export const PortalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const registerPortal = useCallback((id: string, content: ReactNode) => {
    setPortals(prev => {
      const next = new Map(prev);
      next.set(id, content);
      return next;
    });
  }, []);

  const unregisterPortal = useCallback((id: string) => {
    setPortals(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <PortalContext.Provider value={{ registerPortal, unregisterPortal }}>
      <View style={styles.container}>
        {children}
        {/* Portal Host - renders all registered portal content */}
        {Array.from(portals.values()).map((content, index) => (
          <React.Fragment key={index}>{content}</React.Fragment>
        ))}
      </View>
    </PortalContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
