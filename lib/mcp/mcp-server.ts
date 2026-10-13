import { generateStoreFromPrompt, THEME_PRESETS } from '../ai/ai-generator';
import { storeRepo } from '../store-repository';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export interface McpResource {
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
}

// 1. Definition of all MCP Tools
export const MCP_TOOLS: McpTool[] = [
  {
    name: 'create_ai_store',
    description: 'Generates and persists a full-featured e-commerce store from a natural language prompt, including custom theme styling, catalog products with imagery, WhatsApp ordering, and admin credentials.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Customer prompt describing the desired store, e.g. "Luxury perfume store with emerald and gold theme"' },
        plan: { type: 'string', enum: ['free', 'pro', 'advanced'], description: 'Subscription tier (free, pro, or advanced)' },
        selected_theme: { type: 'string', description: 'Visual theme preset (emerald, royal-gold, velvet-rose, cyber-slate, artisan-cream)' },
        custom_store_name: { type: 'string', description: 'Optional explicit store name' },
        whatsapp_number: { type: 'string', description: 'Seller WhatsApp number for customer orders' },
        owner_email: { type: 'string', description: 'Email address of the customer / store admin' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'generate_products',
    description: 'Generates realistic e-commerce products with images, prices, and descriptions matching a store niche or prompt.',
    inputSchema: {
      type: 'object',
      properties: {
        niche_or_prompt: { type: 'string', description: 'Category or product description, e.g. "summer lawn collection" or "oriental oud perfumes"' },
        count: { type: 'number', description: 'Number of products to generate (1 to 10)' },
        store_id: { type: 'string', description: 'Store ID or slug to attach the products to' }
      },
      required: ['niche_or_prompt']
    }
  },
  {
    name: 'customize_store_theme',
    description: 'Customizes visual theme colors, typography, and headline copy of an existing store.',
    inputSchema: {
      type: 'object',
      properties: {
        store_slug: { type: 'string', description: 'Slug of the store to customize' },
        theme_preset: { type: 'string', description: 'New theme preset' },
        primary_color: { type: 'string', description: 'Hex code for primary brand color' },
        tagline: { type: 'string', description: 'Updated hero tagline' }
      },
      required: ['store_slug']
    }
  },
  {
    name: 'manage_product',
    description: 'Adds, updates, or deletes a product for a store while enforcing plan limits (Free: 10, Pro: 25, Advanced: unlimited).',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['add', 'update', 'delete'], description: 'Management action to perform' },
        store_slug: { type: 'string', description: 'Target store slug' },
        product_id: { type: 'string', description: 'Product ID (required for update/delete)' },
        product_data: {
          type: 'object',
          description: 'Product fields (name, price, category, description, image_url)'
        }
      },
      required: ['action', 'store_slug']
    }
  },
  {
    name: 'get_store_analytics',
    description: 'Retrieves current catalog, products count, plan status, and live performance metrics of a store.',
    inputSchema: {
      type: 'object',
      properties: {
        store_slug: { type: 'string', description: 'Slug or ID of the store' }
      },
      required: ['store_slug']
    }
  },
  {
    name: 'chat_store_assistant',
    description: 'AI Shopping and Catalog Assistant for a specific store that answers queries based solely on that store catalog.',
    inputSchema: {
      type: 'object',
      properties: {
        store_slug: { type: 'string', description: 'Store slug' },
        user_message: { type: 'string', description: 'User or customer inquiry' }
      },
      required: ['store_slug', 'user_message']
    }
  }
];

// 2. Definition of MCP Prompts
export const MCP_PROMPTS: McpPrompt[] = [
  {
    name: 'ecommerce-store-architect',
    description: 'Guide AI in designing a complete high-converting e-commerce brand identity and catalog structure from a concept prompt.',
    arguments: [
      { name: 'prompt', description: 'User vision for the store', required: true },
      { name: 'plan', description: 'Plan tier: free, pro, advanced', required: false }
    ]
  },
  {
    name: 'product-catalog-designer',
    description: 'Prompt template to curate realistic trending products with persuasive descriptions and Pakistani Rupee / local pricing.',
    arguments: [
      { name: 'niche', description: 'Store niche/industry', required: true }
    ]
  }
];

// 3. Definition of MCP Resources
export const MCP_RESOURCES: McpResource[] = [
  {
    uri: 'buildexom://schemas/store',
    name: 'Store Schema Definition',
    mimeType: 'application/json',
    description: 'Complete data structure for stores, themes, products, and subdomain routing.'
  },
  {
    uri: 'buildexom://plans/limits',
    name: 'Subscription Plan Limits Matrix',
    mimeType: 'application/json',
    description: 'Product limits, category constraints, and WhatsApp checkout capabilities per tier (Free, Pro, Advanced).'
  },
  {
    uri: 'buildexom://themes/presets',
    name: 'Theme Presets Catalog',
    mimeType: 'application/json',
    description: 'Curated color palettes, gradients, and font vibes (Emerald, Royal Gold, Velvet Rose, Cyber Slate, Artisan Cream).'
  }
];

/**
 * Handle incoming MCP JSON-RPC 2.0 requests
 */
export async function handleMcpRequest(request: {
  jsonrpc?: string;
  id?: string | number;
  method: string;
  params?: any;
}) {
  const { id = 1, method, params } = request;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'buildexom-mcp-ai-server',
            version: '1.0.0'
          },
          capabilities: {
            tools: { listChanged: false },
            prompts: { listChanged: false },
            resources: { subscribe: false, listChanged: false }
          }
        }
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS
        }
      };

    case 'prompts/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          prompts: MCP_PROMPTS
        }
      };

    case 'resources/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          resources: MCP_RESOURCES
        }
      };

    case 'resources/read': {
      const uri = params?.uri;
      if (uri === 'buildexom://plans/limits') {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  free: { maxProducts: 10, maxCategories: 3, whatsappCheckout: true, customTheme: false, subdomain: true },
                  pro: { maxProducts: 25, maxCategories: 6, whatsappCheckout: true, customTheme: true, subdomain: true, analytics: true },
                  advanced: { maxProducts: 9999, maxCategories: 999, whatsappCheckout: true, customTheme: true, subdomain: true, aiAssistant: true }
                }, null, 2)
              }
            ]
          }
        };
      }
      if (uri === 'buildexom://themes/presets') {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(THEME_PRESETS, null, 2)
              }
            ]
          }
        };
      }
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Resource not found: ${uri}` }
      };
    }

    case 'tools/call': {
      const toolName = params?.name;
      const args = params?.arguments || {};

      try {
        const executionResult = await executeMcpTool(toolName, args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof executionResult === 'string' ? executionResult : JSON.stringify(executionResult, null, 2)
              }
            ],
            isError: false
          }
        };
      } catch (err: any) {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Tool execution error: ${err.message}` }],
            isError: true
          }
        };
      }
    }

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` }
      };
  }
}

/**
 * Execute specific MCP tools
 */
async function executeMcpTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'create_ai_store': {
      const generated = await generateStoreFromPrompt({
        prompt: args.prompt,
        plan: args.plan,
        selectedTheme: args.selected_theme,
        customStoreName: args.custom_store_name,
        whatsappNumber: args.whatsapp_number,
        ownerEmail: args.owner_email
      });

      // Save to repository (Supabase or local persistent store)
      const savedStore = await storeRepo.saveStore(generated);

      return {
        success: true,
        message: `Store '${savedStore.name}' created successfully with subdomain '${savedStore.slug}.buildexom.store'!`,
        store: savedStore,
        live_url: `/stores/${savedStore.slug}`,
        admin_url: `/store-admin/${savedStore.slug}`,
        credentials: {
          email: savedStore.owner_email,
          default_password: 'store-admin-pass'
        }
      };
    }

    case 'generate_products': {
      const prompt = args.niche_or_prompt || 'fashion';
      const count = Math.min(Math.max(Number(args.count) || 3, 1), 8);
      const generated = await generateStoreFromPrompt({ prompt });
      const products = generated.products.slice(0, count);

      if (args.store_id) {
        for (const p of products) {
          await storeRepo.addProduct(args.store_id, p);
        }
      }

      return {
        success: true,
        count: products.length,
        products
      };
    }

    case 'customize_store_theme': {
      const { store_slug, theme_preset, primary_color, tagline } = args;
      const store = await storeRepo.getStore(store_slug);
      if (!store) throw new Error(`Store with slug '${store_slug}' not found.`);

      const updated = await storeRepo.updateStoreTheme(store_slug, {
        theme_preset,
        primary_color,
        tagline
      });

      return {
        success: true,
        message: 'Store theme updated successfully.',
        store: updated
      };
    }

    case 'manage_product': {
      const { action, store_slug, product_id, product_data } = args;
      if (action === 'add') {
        const product = await storeRepo.addProduct(store_slug, product_data);
        return { success: true, product, message: 'Product added successfully' };
      }
      if (action === 'update') {
        const updated = await storeRepo.updateProduct(store_slug, product_id, product_data);
        return { success: true, product: updated, message: 'Product updated successfully' };
      }
      if (action === 'delete') {
        await storeRepo.deleteProduct(store_slug, product_id);
        return { success: true, message: `Product ${product_id} deleted successfully` };
      }
      throw new Error(`Invalid action: ${action}`);
    }

    case 'get_store_analytics': {
      const store = await storeRepo.getStore(args.store_slug);
      if (!store) throw new Error(`Store '${args.store_slug}' not found.`);
      const products = await storeRepo.getProducts(store.id || store.slug);

      return {
        store_name: store.name,
        slug: store.slug,
        subdomain: `${store.slug}.buildexom.store`,
        plan: store.plan || 'free',
        total_products: products.length,
        max_allowed_products: store.plan === 'free' ? 10 : store.plan === 'pro' ? 25 : 'unlimited',
        whatsapp_number: store.whatsapp_number,
        theme: store.theme?.name || store.selected_theme
      };
    }

    case 'chat_store_assistant': {
      const store = await storeRepo.getStore(args.store_slug);
      const products = await storeRepo.getProducts(args.store_slug);
      const query = (args.user_message || '').trim().toLowerCase();
      const storeName = store?.name || 'our store';
      const categories = Array.from(new Set(products.map((p: any) => p.category)));

      // Greetings
      if (/^(hi|hello|hey|salam|assalam)/i.test(query)) {
        return {
          reply: `Hello! Welcome to *${storeName}*. We offer ${products.length} products in categories: ${categories.join(', ')}. How can I assist you with your shopping?`,
          store_name: storeName
        };
      }

      // Delivery & Shipping
      if (/delivery|shipping|fee|charges|cod/i.test(query)) {
        return {
          reply: `Delivery for ${storeName}: Rs. 200 in Lahore (1-2 days) and Rs. 350 for other cities across Pakistan (2-4 days). Cash on Delivery available!`,
          store_name: storeName
        };
      }

      // Price / Budget queries
      const priceMatch = query.match(/under\s*(\d+)|less than\s*(\d+)|(\d+)\s*tak/i);
      if (priceMatch) {
        const budget = Number(priceMatch[1] || priceMatch[2] || priceMatch[3]);
        const affordable = products.filter((p: any) => p.price <= budget);
        return {
          reply: affordable.length > 0
            ? `Found ${affordable.length} item(s) under Rs. ${budget.toLocaleString()}:\n` + affordable.map((p: any) => `• ${p.name} — Rs. ${p.price}`).join('\n')
            : `No items found under Rs. ${budget.toLocaleString()}. Lowest price starts at Rs. ${Math.min(...products.map((p: any) => p.price))}.`,
          store_name: storeName,
          matches: affordable.length
        };
      }

      // Semantic matching against store catalog
      const matches = products.filter((p: any) => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );

      let reply = '';
      if (matches.length > 0) {
        reply = `Found ${matches.length} matching item(s) in *${storeName}*:\n` +
          matches.map((m: any) => `• *${m.name}* (Rs. ${m.price.toLocaleString()}): ${m.description || m.category}`).join('\n') +
          `\n\nWould you like to order any of these directly via WhatsApp?`;
      } else {
        reply = `Welcome to *${storeName}*! We currently have ${products.length} curated products available in ${categories.join(', ')}. You can ask about our bestsellers, prices, or order via WhatsApp!`;
      }

      return {
        reply,
        catalog_matches: matches.length,
        store_name: storeName
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
