export interface TooltipOption {
  name: string;
  description: string;
}

export interface TooltipData {
  title: string;
  description: string;
  options?: TooltipOption[];
}

class TooltipHelper {
  private static instance: TooltipHelper;

  private tooltips: Record<string, TooltipData> = {};

  private initialized = false;

  private static readonly TOOLTIP_URL =
    'https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json';

  static getInstance(): TooltipHelper {
    if (!TooltipHelper.instance) {
      TooltipHelper.instance = new TooltipHelper();
    }
    return TooltipHelper.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const response = await fetch(TooltipHelper.TOOLTIP_URL);
      if (!response.ok) {
        this.initialized = true;
        return;
      }

      const json = (await response.json()) as Record<string, unknown>;
      const parsed: Record<string, TooltipData> = {};

      Object.entries(json).forEach(([key, value]) => {
        if (typeof value !== 'object' || value === null) {
          return;
        }

        const item = value as Record<string, unknown>;
        const title = typeof item.title === 'string' ? item.title : '';
        const description =
          typeof item.description === 'string' ? item.description : '';
        const options = Array.isArray(item.options)
          ? item.options
              .map((option) => {
                if (typeof option !== 'object' || option === null) {
                  return null;
                }
                const optionRecord = option as Record<string, unknown>;
                const name =
                  typeof optionRecord.name === 'string'
                    ? optionRecord.name
                    : '';
                const optionDescription =
                  typeof optionRecord.description === 'string'
                    ? optionRecord.description
                    : '';

                if (!name || !optionDescription) {
                  return null;
                }

                return { name, description: optionDescription };
              })
              .filter((option): option is TooltipOption => option !== null)
          : undefined;

        if (!title || !description) {
          return;
        }

        parsed[key] = { title, description, options };
      });

      this.tooltips = parsed;
    } catch {
      this.tooltips = {};
    }

    this.initialized = true;
  }

  getTooltip(key: string): TooltipData | undefined {
    return this.tooltips[key];
  }
}

export default TooltipHelper;
