import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateAISummary(listing: Record<string, unknown>): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Summarize this real estate listing in 2-3 engaging sentences for a potential buyer. 
Focus on the key selling points. Write in English, be concise and objective.

Listing details:
- Title: ${listing.title}
- Type: ${listing.property_type}, ${listing.listing_type}
- Location: ${listing.district}, ${listing.city}
- Price: ${listing.price} ${listing.currency} (${listing.price_per_sqm} PLN/m²)
- Area: ${listing.area_sqm} m²
- Rooms: ${listing.rooms}
- Floor: ${listing.floor}/${listing.total_floors}
- Features: ${[
  listing.has_parking ? 'parking' : '',
  listing.has_balcony ? 'balcony' : '',
  listing.has_elevator ? 'elevator' : '',
  listing.has_storage ? 'storage' : '',
].filter(Boolean).join(', ') || 'none listed'}
- Condition: ${listing.condition_type || 'not specified'}
- Description: ${(listing.description as string)?.substring(0, 300)}

Write only the summary, no preamble.`,
      },
    ],
  });

  return (message.content[0] as { text: string }).text.trim();
}

export async function parseRawListing(rawText: string): Promise<Record<string, unknown>> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `Parse this raw real estate listing text and extract structured data.
Return ONLY valid JSON with these fields (use null for missing):
title, price (number), area_sqm (number), rooms (number), floor (number),
total_floors (number), city, district, description, has_parking (bool),
has_balcony (bool), has_elevator (bool), year_built (number),
condition_type (one of: "new", "good", "needs_renovation", "developer_standard"),
heating_type (string)

Raw text:
${rawText}

Return only JSON.`,
      },
    ],
  });

  const text = (message.content[0] as { text: string }).text.trim();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}