import { NextResponse } from 'next/server';
import { handleMcpRequest } from '@/lib/mcp/mcp-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Standard JSON-RPC validation
    if (!body || typeof body.method !== 'string') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id: body?.id ?? null,
        error: { code: -32600, message: 'Invalid Request: method string is required.' }
      }, { status: 400 });
    }

    const response = await handleMcpRequest(body);
    return NextResponse.json(response);

  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: `Internal server error: ${err.message}` }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Buildexom AI Store Builder - Model Context Protocol (MCP) Server',
    status: 'online',
    version: '1.0.0',
    protocol: 'mcp-jsonrpc-2.0',
    capabilities: ['tools/list', 'tools/call', 'prompts/list', 'resources/list']
  });
}
