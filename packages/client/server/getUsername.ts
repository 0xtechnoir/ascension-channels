import fetch from "node-fetch";
import "dotenv/config";

const NEYNAR_API_KEY = process.env.VITE_NEYNAR_API_KEY;

const getUsername = async (fid: number) => {
    const url = 'https://api.neynar.com/v2/farcaster/user/bulk?fids=192644';
    const options = {
      method: 'GET',
      headers: {accept: 'application/json', api_key: NEYNAR_API_KEY || ''}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log('Response:', data);
      return data.users[0].display_name;
    } catch (err) {
      console.error('error:' + err);
    }
};

export default getUsername;
