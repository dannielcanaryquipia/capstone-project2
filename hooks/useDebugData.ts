import { useCallback, useEffect, useState } from 'react';
import { DebugResult, DebugService } from '../services/debug.service';

export interface DebugInfo {
  connectionStatus: 'testing' | 'connected' | 'error';
  errors: string[];
  warnings: string[];
  lastTest: Date | null;
  diagnosticResults: {
    connection: DebugResult | null;
    adminData: DebugResult | null;
    userAccess: DebugResult | null;
  };
}

export const useDebugData = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    connectionStatus: 'testing',
    errors: [],
    warnings: [],
    lastTest: null,
    diagnosticResults: {
      connection: null,
      adminData: null,
      userAccess: null,
    },
  });

  const testConnection = useCallback(async () => {
    setDebugInfo(prev => ({ 
      ...prev, 
      connectionStatus: 'testing',
      errors: [],
      warnings: [],
    }));
    
    const result = await DebugService.testDatabaseConnection();
    
    if (result.success) {
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: 'connected',
        errors: [],
        lastTest: new Date(),
        diagnosticResults: {
          ...prev.diagnosticResults,
          connection: result,
        },
      }));
    } else {
      setDebugInfo(prev => ({
        ...prev,
        connectionStatus: 'error',
        errors: [result.error?.message || 'Database connection failed'],
        lastTest: new Date(),
        diagnosticResults: {
          ...prev.diagnosticResults,
          connection: result,
        },
      }));
    }
  }, []);

  const testAdminData = useCallback(async () => {
    const result = await DebugService.testAdminDataFetching();
    
    setDebugInfo(prev => ({
      ...prev,
      diagnosticResults: {
        ...prev.diagnosticResults,
        adminData: result,
      },
    }));
    
    if (!result.success) {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `Admin data: ${result.error?.message || 'Failed'}`],
      }));
    }
  }, []);

  const testUserAccess = useCallback(async () => {
    const result = await DebugService.testUserRoleAccess();
    
    setDebugInfo(prev => ({
      ...prev,
      diagnosticResults: {
        ...prev.diagnosticResults,
        userAccess: result,
      },
    }));
    
    if (!result.success) {
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `User access: ${result.error?.message || 'Failed'}`],
      }));
    }
  }, []);

  const runFullDiagnostic = useCallback(async () => {
    setDebugInfo(prev => ({ 
      ...prev, 
      connectionStatus: 'testing',
      errors: [],
      warnings: [],
    }));
    
    const diagnostic = await DebugService.runFullDiagnostic();
    
    setDebugInfo(prev => ({
      ...prev,
      connectionStatus: diagnostic.summary.allPassed ? 'connected' : 'error',
      errors: diagnostic.summary.errors,
      warnings: diagnostic.summary.warnings,
      lastTest: new Date(),
      diagnosticResults: {
        connection: diagnostic.connection,
        adminData: diagnostic.adminData,
        userAccess: diagnostic.userAccess,
      },
    }));
  }, []);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return {
    debugInfo,
    testConnection,
    testAdminData,
    testUserAccess,
    runFullDiagnostic,
  };
};
