import { useState, useEffect } from 'react';
import { LiveMatch } from '../types';

export const useLiveMatches = (matchId: string) => {
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    
    const connectToSSE = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        eventSource = new EventSource(`https://live.api.footium.club/api/sse/all_live_match_scores/${matchId}`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data && data.length > 0) {
            // The first update usually has the complete match data
            const matchUpdate = data[0];
            if (matchUpdate.type === "UPDATE" && matchUpdate.value && matchUpdate.value[matchId]) {
              setLiveMatch(matchUpdate.value[matchId]);
              setIsLoading(false);
            }
          }
        };
        
        eventSource.onerror = () => {
          setError('Connection to live match feed failed');
          setIsLoading(false);
          if (eventSource) {
            eventSource.close();
          }
        };
      } catch (err) {
        setError('Failed to connect to live match feed');
        setIsLoading(false);
      }
    };
    
    connectToSSE();
    
    // Clean up
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [matchId]);
  
  return { liveMatch, isLoading, error };
};

export default useLiveMatches;
