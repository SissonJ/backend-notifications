import * as fs from 'fs';
import { config } from 'dotenv';
import {
 GraphQLResponse, PoolsResponse, 
} from './types';

config();
const NOTIFICATION_INTERVAL = 3_600_000;

async function main() {
  const notificationsLog = fs.readFileSync('./notifications.txt', 'utf-8');
  let notifications: number[] = JSON.parse(notificationsLog);

  const now = new Date();

  const query = `
    query {
      pools(query:{
        take: 1
      }) {
        updatedAt
      }
    }
  `;

  const response = await fetch(process.env.GRAPHQL!, {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ query, })
  });

  const responseBody: GraphQLResponse<PoolsResponse> = await response.json();
  if (responseBody.errors) {
      console.error("GraphQL Errors:", responseBody.errors);
  }

  if (!responseBody?.data?.pools?.length && responseBody.data!.pools.length < 1) {
    return;
  }

  const updatedAt = new Date(responseBody.data!.pools[0].updatedAt);
  const lastNotification = notifications.length > 0 ? notifications[0] : 0;
  if( now.getTime() - updatedAt.getTime() > 60_000 * 5 
     && now.getTime() - lastNotification > NOTIFICATION_INTERVAL
    ) {

    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN!}/sendMessage`, 
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: process.env.SISSONJ_CHAT_ID,
            text: `*[ALERT]: Last Pool Update More than 5 minutes ago*`,
            parse_mode: "Markdown"
        })
    });

    notifications = [now.getTime()];
    fs.writeFileSync('./notifications.txt', JSON.stringify(notifications));
  }
}

Promise.resolve(main());
