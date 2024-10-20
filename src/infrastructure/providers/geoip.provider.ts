import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '../http/http.service';
import { GeoIPResponse } from 'src/application/interfaces/geo-ip-response.interface';


@Injectable()
export class GeoIpProvider {
  private readonly logger = new Logger(GeoIpProvider.name);

  constructor(private readonly httpService: HttpService) {}

  async getGeoData(ip: string): Promise<GeoIPResponse> {
    try {
      const response = await this.httpService.get<GeoIPResponse>(`http://ip-api.com/json/${ip}`);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching geolocation data for IP ${ip}: ${error.message}`);
      throw new BadRequestException(`Unable to validate IP location`);
    }
  }
}
