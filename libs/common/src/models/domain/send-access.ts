import { SendType } from "../../enums/sendType";
import { SendAccessResponse } from "../response/sendAccessResponse";
import { SendAccessView } from "../view/send-access.view";

import Domain from "./domain-base";
import { EncString } from "./enc-string";
import { SendFile } from "./send-file";
import { SendText } from "./send-text";
import { SymmetricCryptoKey } from "./symmetric-crypto-key";

export class SendAccess extends Domain {
  id: string;
  type: SendType;
  name: EncString;
  file: SendFile;
  text: SendText;
  expirationDate: Date;
  creatorIdentifier: string;

  constructor(obj?: SendAccessResponse) {
    super();
    if (obj == null) {
      return;
    }

    this.buildDomainModel(
      this,
      obj,
      {
        id: null,
        name: null,
        expirationDate: null,
        creatorIdentifier: null,
      },
      ["id", "expirationDate", "creatorIdentifier"]
    );

    this.type = obj.type;

    switch (this.type) {
      case SendType.Text:
        this.text = new SendText(obj.text);
        break;
      case SendType.File:
        this.file = new SendFile(obj.file);
        break;
      default:
        break;
    }
  }

  async decrypt(key: SymmetricCryptoKey): Promise<SendAccessView> {
    const model = new SendAccessView(this);

    await this.decryptObj(
      model,
      {
        name: null,
      },
      null,
      key
    );

    switch (this.type) {
      case SendType.File:
        model.file = await this.file.decrypt(key);
        break;
      case SendType.Text:
        model.text = await this.text.decrypt(key);
        break;
      default:
        break;
    }

    return model;
  }
}
