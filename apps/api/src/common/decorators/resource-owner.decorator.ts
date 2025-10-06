import { SetMetadata } from '@nestjs/common';

export const ResourceOwner = (paramName: string) =>
  SetMetadata('resourceOwnerParam', paramName);
