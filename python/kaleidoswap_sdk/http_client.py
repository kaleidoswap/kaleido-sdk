import logging
from typing import Dict, Any, Optional

import aiohttp

logger = logging.getLogger(__name__)

class HttpClient:
    """HTTP client for Kaleidoswap API."""
    
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        """Initialize HTTP client.
        
        Args:
            base_url: Base URL for API
            api_key: Optional API key for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = None
        
    async def _ensure_session(self):
        """Ensure aiohttp session exists."""
        if self.session is None:
            self.session = aiohttp.ClientSession()
            
    async def close(self):
        """Close the HTTP session."""
        if self.session:
            await self.session.close()
            self.session = None
            
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests.
        
        Returns:
            Dict of headers including auth if api_key present
        """
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        return headers
        
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make HTTP request to API.
        
        Args:
            method: HTTP method (GET, POST, etc)
            endpoint: API endpoint
            data: Optional request data
            
        Returns:
            API response as dict
            
        Raises:
            aiohttp.ClientError: If request fails
        """
        await self._ensure_session()
        url = f"{self.base_url}{endpoint}"
        headers = self._get_headers()
        
        try:
            async with self.session.request(
                method,
                url,
                json=data,
                headers=headers
            ) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"HTTP request failed: {e}")
            raise
            
    async def get(self, endpoint: str) -> Dict[str, Any]:
        """Make GET request.
        
        Args:
            endpoint: API endpoint
            
        Returns:
            API response as dict
        """
        return await self._request('GET', endpoint)
        
    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make POST request.
        
        Args:
            endpoint: API endpoint
            data: Request data
            
        Returns:
            API response as dict
        """
        return await self._request('POST', endpoint, data)

    async def get_quote(
        self,
        from_asset: str,
        to_asset: str,
        amount: float,
        is_exact_input: bool = True
    ) -> Dict:
        """Get quote for swap.
        
        Args:
            from_asset: Source asset (e.g., 'BTC')
            to_asset: Destination asset (e.g., 'USDT')
            amount: Amount to swap
            is_exact_input: Whether amount is input (True) or output (False)
            
        Returns:
            Dict containing quote details
        """
        params = {
            "from_asset": from_asset,
            "to_asset": to_asset,
            "amount": str(amount),
            "is_exact_input": str(is_exact_input).lower()
        }
        
        return await self._request("GET", "/v1/quote", params=params)

    async def get_market_data(
        self,
        from_asset: str,
        to_asset: str
    ) -> Dict:
        """Get market data for trading pair.
        
        Args:
            from_asset: Source asset (e.g., 'BTC')
            to_asset: Destination asset (e.g., 'USDT')
            
        Returns:
            Dict containing market data
        """
        params = {
            "from_asset": from_asset,
            "to_asset": to_asset
        }
        
        return await self._request("GET", "/v1/market", params=params)

    async def list_assets(self) -> Dict:
        """List available assets.
        
        Returns:
            Dict containing list of assets
        """
        return await self._request("GET", "/v1/assets")

    async def list_pairs(self) -> Dict:
        """List available trading pairs.
        
        Returns:
            Dict containing list of trading pairs
        """
        return await self._request("GET", "/v1/pairs") 