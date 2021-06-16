import {deleteImage} from "../images/imagekit"


export const DeleteImage = async (root, args, context, info) => {
  const session = context.driver.session();
  const txc = session.beginTransaction();

  const current_user = context.user;
  if (!current_user) {
    throw new AuthenticationError('You must be authenticated');
  }

  try {
    const { uuid } = args

    const result = await txc.run(
      `
      MATCH (i:Image {uuid: $uuid})<-[r:OWN_IMAGE]-(p:Person)<-[:IS_PERSON]-(u:User {uuid: $user})
      RETURN i
      `,
      { uuid, user: current_user.uuid }
    );

    const img = result.records[0].get('i').properties;
    await deleteImage(img.fileId);
    await txc.run(
      `
      MATCH (i:Image {uuid: $uuid})<-[r:OWN_IMAGE]-(p:Person)<-[:IS_PERSON]-(u:User {uuid: $user})
      DETACH DELETE i
      `,
      { uuid, user: current_user.uuid }
    );
  
    await txc.commit();
    return true;
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }
};