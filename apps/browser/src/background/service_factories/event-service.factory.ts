import { EventService as AbstractEventService } from "@bitwarden/common/abstractions/event.service";
import { EventService } from "@bitwarden/common/services/event.service";
import { NoopEventService } from "@bitwarden/common/services/noopEvent.service";

import { apiServiceFactory, ApiServiceInitOptions } from "./api-service.factory";
import { cipherServiceFactory, CipherServiceInitOptions } from "./cipher-service.factory";
import { CachedServices, factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  organizationServiceFactory,
  OrganizationServiceInitOptions,
} from "./organization-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type EventServiceFactoryOptions = FactoryOptions & {
  eventServiceOptions: {
    useNoopService: boolean;
  };
};

export type EventServiceInitOptions = EventServiceFactoryOptions &
  ApiServiceInitOptions &
  CipherServiceInitOptions &
  StateServiceInitOptions &
  LogServiceInitOptions &
  OrganizationServiceInitOptions;

export function eventServiceFactory(
  cache: { eventService?: AbstractEventService } & CachedServices,
  opts: EventServiceInitOptions
): Promise<AbstractEventService> {
  return factory(cache, "eventService", opts, async () => {
    if (opts.eventServiceOptions.useNoopService) {
      return new NoopEventService();
    }

    return new EventService(
      await apiServiceFactory(cache, opts),
      await cipherServiceFactory(cache, opts),
      await stateServiceFactory(cache, opts),
      await logServiceFactory(cache, opts),
      await organizationServiceFactory(cache, opts)
    );
  });
}
