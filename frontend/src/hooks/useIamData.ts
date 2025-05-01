import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseIamDataProps<T> {
  endpoint: string;
  initialData: T;
  refreshInterval?: number; // in milliseconds
  deps?: any[];
}

export function useIamData<T>({
  endpoint,
  initialData,
  refreshInterval = 0,
  deps = []
}: UseIamDataProps<T>) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('jwtToken');
        
        if (!token) {
          if (isMounted) {
            setError(new Error('Authentication token not found'));
            setIsLoading(false);
          }
          return;
        }

        // Add error handling for network issues
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          // Add timeout to prevent hanging requests
          timeout: 10000
        }).catch(err => {
          // Log the specific error for debugging
          console.error(`API request failed for ${endpoint}:`, err.message);
          throw err;
        });
        
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching IAM data:', err);
          // Use the initialData as fallback when API fails
          // This prevents the UI from breaking
          setData(initialData);
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Execute fetchData but catch any errors to prevent crashing
    fetchData().catch(err => {
      console.error('Unhandled error in fetchData:', err);
      if (isMounted) {
        setIsLoading(false);
        setError(err instanceof Error ? err : new Error('An unhandled error occurred'));
      }
    });
    
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        fetchData().catch(err => {
          console.error('Unhandled error in interval fetchData:', err);
        });
      }, refreshInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [endpoint, ...deps]);

  // Function to manually trigger a refresh
  const refetch = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('jwtToken');
      
      if (!token) {
        setError(new Error('Authentication token not found'));
        setIsLoading(false);
        return;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000
      });
      
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error refetching IAM data:', err);
      // Keep the current data on error instead of breaking the UI
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}

export default useIamData;